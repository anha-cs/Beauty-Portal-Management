import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-appointment-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-records.component.html'
})
export class AppointmentRecordsComponent implements OnInit {
  public appointments: any[] = [];
  public filteredAppointments: any[] = [];
  public searchText: string = '';
  public isAdmin: boolean = false;
  public isStaff: boolean = false;

  // Canonical _id for STAFF (from /staff/me). For customer we won't rely on it.
  private myUserId: string = '';

  constructor(public apiService: ApiService) {}

  ngOnInit() {
    this.isAdmin = this.apiService.hasRole('ADMIN');
    this.isStaff = this.apiService.hasRole('STAFF');

    // ✅ STAFF: get real Mongo _id for strict filtering + permission
    if (this.isStaff && !this.isAdmin) {
      this.apiService.get<any>('/staff/me').subscribe({
        next: (me) => {
          this.myUserId = String(me?._id || me?.id || '');
          this.loadRecords();
        },
        error: () => {
          // fallback (still try)
          this.myUserId = String(this.apiService.getUserId() || '');
          this.loadRecords();
        }
      });
      return;
    }

    // ✅ Admin/Customer: just load records (customer id filtering is handled by backend)
    this.myUserId = String(this.apiService.getUserId() || '');
    this.loadRecords();
  }

  loadRecords() {
    // ✅ role-filtered NON-BLOCK records from backend
    this.apiService.get<any[]>('/appointments/records').subscribe({
      next: (data) => {
        const rows = data || [];

        // ✅ IMPORTANT:
        // - Admin: show all returned (should be all records)
        // - Staff: STRICT filter to their own staffId (prevents leaks even if backend fails)
        // - Customer: do NOT id-filter here (because getUserId() may not match Mongo _id)
        let safe = rows;

        if (this.isStaff && !this.isAdmin) {
          safe = rows.filter(a => {
            const staffId = String(a?.staffId?._id || a?.staffId || '');
            return staffId === this.myUserId;
          });
        }

        // newest first
        safe.sort((a, b) => {
          const ta = new Date(a?.dateTime || 0).getTime();
          const tb = new Date(b?.dateTime || 0).getTime();
          return tb - ta;
        });

        this.appointments = safe;
        this.filterResults();
      },
      error: () => {
        this.appointments = [];
        this.filteredAppointments = [];
      }
    });
  }

  /**
   * ✅ Admin can manage any PENDING appointment
   * ✅ Staff can manage only their own PENDING appointment
   * ❌ Customers cannot manage
   * ❌ Blocks never manageable here
   */
  canManage(appt: any): boolean {
    if (!appt) return false;

    const isBlocked =
      appt?.isBlock === true || String(appt?.status || '').toUpperCase() === 'BLOCKED';
    if (isBlocked) return false;

    const status = String(appt?.status || '').toUpperCase();
    if (status !== 'PENDING') return false;

    if (this.isAdmin) return true;

    if (this.isStaff && !this.isAdmin) {
      const staffId = String(appt?.staffId?._id || appt?.staffId || '');
      return staffId === this.myUserId;
    }

    return false;
  }

  updateStatus(apptId: any, newStatus: string) {
    if (!apptId) return;

    const local = this.appointments.find(a => String(a.id || a._id) === String(apptId));
    if (!local || !this.canManage(local)) return;

    this.apiService.post('/appointments/update-status', { id: String(apptId), status: newStatus }).subscribe({
      next: () => {
        local.status = newStatus;
        this.filterResults();
      }
    });
  }

  filterResults() {
    const s = (this.searchText || '').toLowerCase().trim();
    if (!s) {
      this.filteredAppointments = [...this.appointments];
      return;
    }

    this.filteredAppointments = (this.appointments || []).filter(a =>
      String(a.customerName || '').toLowerCase().includes(s) ||
      String(a.customerEmail || '').toLowerCase().includes(s) ||
      String(a.customerPhone || '').toLowerCase().includes(s) ||
      String(a.serviceName || '').toLowerCase().includes(s) ||
      String(a.staffName || '').toLowerCase().includes(s) ||
      String(a.location || 'studio').toLowerCase().includes(s)
    );
  }
}
