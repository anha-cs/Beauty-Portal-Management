import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../service/api.service';
import {
  ScheduleModule,
  MonthService,
  EventSettingsModel,
  ScheduleComponent,
  GroupModel,
  RenderCellEventArgs,
  CellClickEventArgs,
  PopupOpenEventArgs
} from '@syncfusion/ej2-angular-schedule';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleModule],
  providers: [MonthService],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css'
})
export class NewAppointmentComponent implements OnInit {
  @ViewChild('scheduleObj') public scheduleObj?: ScheduleComponent;

  public isAdmin = false;
  public isStaff = false;
  public isBlockMode = false;

  public services: any[] = [];
  public customers: any[] = [];
  public selectedServices: any[] = [];
  public selectedCustomer: any = null;

  public allStaffRaw: any[] = [];
  public selectedStaff: any = null;

  public group: GroupModel = { resources: ['Staffs'] };
  public staffResourceData: any[] = [];

  // datasource contains ONLY blocks
  public eventSettings: EventSettingsModel = { dataSource: [] };

  public selectedSlots: any[] = [];
  public currentStaffDbId = '';

  public toastMessage = '';
  public showToast = false;
  public toastType: 'success' | 'error' = 'success';

  // -----------------------------
  // ADMIN: Add/Delete Service UI
  // Default icons: ✨👁️ 💅 🦋💄🎀🧖‍♀️💆‍♀️💇‍♀️👰🤵‍♂️
  // -----------------------------
  public defaultIcons: string[] = ['✨', '👁️', '💅', '🦋', '💄', '🎀', '🧖‍♀️', '💆‍♀️', '💇‍♀️', '👰', '🤵‍♂️'];
  private defaultIconIndex = 0;

  public newServiceName = '';
  public newServicePrice: number | null = null;
  public newServiceIcon = '';

  // -----------------------------
  // NEW: Booking details (location, time, notes)
  // -----------------------------
  public location = '';
  public notes = '';
  public selectedTime: string | null = null;

  // basic times list (you can customize)
  public availableTimes: string[] = [
    '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM',
    '06:00 PM'
  ];

  constructor(public apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.isAdmin = this.apiService.hasRole('ADMIN');
    this.isStaff = this.apiService.hasRole('STAFF');

    // STAFF: self-only
    if (this.isStaff && !this.isAdmin) {
      this.isBlockMode = true;

      this.apiService.get<any>('/staff/me').subscribe({
        next: (me) => {
          this.currentStaffDbId = String(me?._id || me?.id || '');
          if (!this.currentStaffDbId) {
            this.triggerToast('Cannot identify your staff id', 'error');
            return;
          }

          this.staffResourceData = [{
            id: this.currentStaffDbId,
            text: me.firstName || 'Me',
            color: '#ec4899'
          }];
          this.group = { resources: ['Staffs'] };

          this.loadBlockedDays();
          this.cdr.detectChanges();
        },
        error: () => this.triggerToast('Failed to load staff profile', 'error')
      });

      return;
    }

    // ADMIN / CUSTOMER: load staff list
    this.apiService.get<any[]>('/staff/all').subscribe({
      next: (staffs) => {
        this.allStaffRaw = staffs || [];
        this.renderAllStaff(this.allStaffRaw);

        this.loadBlockedDays();
        this.loadServices();

        // IMPORTANT: for admin booking, customers list MUST return User documents with _id
        if (this.isAdmin) this.loadCustomers();

        this.cdr.detectChanges();
      },
      error: () => this.triggerToast('Failed to load staff list', 'error')
    });
  }

  private renderAllStaff(staffs: any[]) {
    this.staffResourceData = (staffs || []).map(s => ({
      id: String(s._id || s.id),
      text: s.firstName,
      color: '#ec4899'
    }));
    this.group = { resources: ['Staffs'] };
  }

  onStaffChange(staff: any) {
    if (this.isStaff && !this.isAdmin) return;

    this.selectedStaff = staff;
    this.selectedSlots = [];

    // reset details when switching staff
    this.resetBookingDetails();

    if (!staff) {
      this.renderAllStaff(this.allStaffRaw);
    } else {
      this.staffResourceData = [{
        id: String(staff._id || staff.id),
        text: staff.firstName,
        color: '#ec4899'
      }];
      this.group = { resources: ['Staffs'] };
    }

    this.loadBlockedDays();
    this.scheduleObj?.refresh();
    this.cdr.detectChanges();
  }

  private getShownStaffIds(): string[] {
    return (this.staffResourceData || []).map(r => String(r.id));
  }

  private getCellStaffId(groupIndex?: number): string {
    if (this.staffResourceData?.length && groupIndex !== undefined && groupIndex !== null) {
      return String(this.staffResourceData[groupIndex]?.id || '');
    }
    return String(this.currentStaffDbId || '');
  }

  // ---- BLOCKS ONLY ----
  loadBlockedDays() {
    const url = (this.isStaff && !this.isAdmin)
      ? '/appointments/blocks/mine'
      : '/appointments/blocks';

    this.apiService.get<any[]>(url).subscribe({
      next: (rows) => {
        const shown = this.getShownStaffIds();

        const filtered = (rows || []).filter(a => {
          const staffId = String(a.staffId?._id || a.staffId);
          return shown.includes(staffId);
        });

        const mapped = filtered.map(a => {
          const start = new Date(a.dateTime);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(end.getDate() + 1);

          return {
            Id: String(a._id || a.id),
            Subject: 'UNAVAILABLE',
            StartTime: start,
            EndTime: end,
            IsAllDay: true,
            IsBlock: true,
            StaffId: String(a.staffId?._id || a.staffId)
          };
        });

        this.eventSettings = { dataSource: mapped };
        this.cdr.detectChanges();
        this.scheduleObj?.refresh();
      },
      error: () => this.triggerToast('Failed to load blocked days', 'error')
    });
  }

  onCellClick(args: CellClickEventArgs): void {
    args.cancel = true;
    if (!args.startTime) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (args.startTime < today) {
      this.triggerToast('Cannot modify past dates', 'error');
      return;
    }

    const cellStaffId = this.getCellStaffId(args.groupIndex);
    if (!cellStaffId) return;

    const data = (this.eventSettings.dataSource as any[]) || [];

    const existingBlock = data.find(e =>
      new Date(e.StartTime).toDateString() === args.startTime!.toDateString() &&
      e.IsBlock === true &&
      String(e.StaffId) === String(cellStaffId)
    );

    // unblock
    if (existingBlock) {
      const canUnblock =
        this.isAdmin ||
        (this.isStaff && !this.isAdmin && String(cellStaffId) === String(this.currentStaffDbId));

      if (!canUnblock) {
        this.triggerToast('This day is unavailable', 'error');
        return;
      }

      if (confirm('Make this day available?')) {
        this.apiService.delete(`/appointments/${existingBlock.Id}`).subscribe({
          next: () => {
            this.triggerToast('Availability Restored');
            this.selectedSlots = [];
            this.resetBookingDetails();
            this.loadBlockedDays();
          },
          error: () => this.triggerToast('Failed to unblock', 'error')
        });
      }
      return;
    }

    // select
    const isSameDay = this.selectedSlots.some(s =>
      s.date.toDateString() === args.startTime!.toDateString() &&
      String(s.staffId) === String(cellStaffId)
    );

    this.selectedSlots = isSameDay ? [] : [{
      id: new Date().getTime(),
      date: args.startTime,
      staffId: cellStaffId
    }];

    // if unselecting the date, reset details
    if (this.selectedSlots.length === 0) {
      this.resetBookingDetails();
    }

    this.cdr.detectChanges();
  }

  onRenderCell(args: RenderCellEventArgs): void {
    if (args.elementType !== 'monthCells') return;

    const element = args.element as HTMLElement;
    const data = (this.eventSettings.dataSource as any[]) || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (args.date! < today) {
      element.style.opacity = '0.3';
      element.style.backgroundColor = '#f1f5f9';
      element.style.pointerEvents = 'none';
      return;
    }

    const cellStaffId = this.getCellStaffId(args.groupIndex);

    const isBlocked = data.some(e =>
      new Date(e.StartTime).toDateString() === args.date!.toDateString() &&
      e.IsBlock === true &&
      String(e.StaffId) === String(cellStaffId)
    );

    const isSelected = this.selectedSlots.some(s =>
      s.date.toDateString() === args.date!.toDateString() &&
      String(s.staffId) === String(cellStaffId)
    );

    element.style.backgroundColor = '';
    const oldLabel = element.querySelector('.custom-block-label');
    if (oldLabel) oldLabel.remove();

    if (isBlocked) {
      element.style.backgroundColor = '#cbd5e1';
      element.style.position = 'relative';

      const label = document.createElement('div');
      label.className = 'custom-block-label';
      label.innerHTML = '🚫 UNAVAILABLE';
      label.setAttribute('style',
        'position:absolute; bottom:4px; width:100%; text-align:center; font-size:8px; font-weight:bold; color:#64748b; pointer-events:none;'
      );
      element.appendChild(label);
    } else if (isSelected) {
      element.style.backgroundColor = this.isBlockMode ? '#334155' : '#fbcfe8';
    }
  }

  submitAction() {
    if (this.selectedSlots.length === 0) return;

    const slot = this.selectedSlots[0];
    const staffId = String(slot.staffId);

    // STAFF: create block
    if (this.isStaff && !this.isAdmin) {
      if (staffId !== String(this.currentStaffDbId)) {
        this.triggerToast('You can only modify your own schedule', 'error');
        return;
      }

      const payload = {
        staffId,
        dateTime: new Date(slot.date).toISOString(),
        isBlock: true,
        status: 'BLOCKED',
        serviceName: 'STAFF_BLOCK',
        customerName: 'N/A (Staff Block)',
        price: 0
      };

      this.apiService.post('/appointments/book', payload).subscribe({
        next: () => {
          this.triggerToast('Availability Updated');
          this.selectedSlots = [];
          this.resetBookingDetails();
          this.loadBlockedDays();
        },
        error: () => this.triggerToast('Failed to block day', 'error')
      });

      return;
    }

    // ADMIN/CUSTOMER: booking
    if (this.selectedServices.length === 0) {
      this.triggerToast('Please select at least one service', 'error');
      return;
    }

    if (this.isAdmin && !this.selectedCustomer) {
      this.triggerToast('Admin must select a customer', 'error');
      return;
    }

    // require time for booking (not for block)
    if (!this.selectedTime) {
      this.triggerToast('Please select a time', 'error');
      return;
    }

    // Combine date + selectedTime into ISO string
    const dateTimeISO = this.combineDateAndTime(slot.date, this.selectedTime);
    if (!dateTimeISO) {
      this.triggerToast('Invalid time selection', 'error');
      return;
    }

    // ✅ CRITICAL: customerId must be User._id string (ObjectId hex)
    const customerId = this.isAdmin
      ? String(this.selectedCustomer?._id || this.selectedCustomer?.id)
      : String(this.apiService.getUserId());

    const payload: any = {
      customerId,
      customerName: this.isAdmin ? this.selectedCustomer?.firstName : this.apiService.getUserName(),
      staffId,
      serviceName: this.selectedServices.map(s => s.name).join(', '),
      dateTime: dateTimeISO,
      isBlock: false,
      status: 'PENDING',
      price: this.totalAmount
    };

    // optional fields
    if ((this.location || '').trim()) payload.location = (this.location || '').trim();
    if ((this.notes || '').trim()) payload.notes = (this.notes || '').trim();

    this.apiService.post('/appointments/book', payload).subscribe({
      next: () => {
        this.triggerToast('Booking Requested');
        this.selectedSlots = [];
        this.selectedServices = [];
        this.resetBookingDetails();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to book';
        this.triggerToast(msg, 'error');
      }
    });
  }

  // -----------------------------
  // SERVICES
  // -----------------------------
  loadServices() {
    this.apiService.get<any[]>('/services/all').subscribe({
      next: d => this.services = d || [],
      error: () => this.triggerToast('Failed to load services', 'error')
    });
  }

  // Admin: Add service
  addService() {
    if (!this.isAdmin) return;

    const name = (this.newServiceName || '').trim();
    const price = Number(this.newServicePrice);
    const iconRaw = (this.newServiceIcon || '').trim();

    if (!name) {
      this.triggerToast('Service name is required', 'error');
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      this.triggerToast('Service price must be > 0', 'error');
      return;
    }

    const icon = iconRaw || this.defaultIcons[this.defaultIconIndex++ % this.defaultIcons.length];
    const payload = { name, price, icon };

    this.apiService.post('/services', payload).subscribe({
      next: () => {
        this.triggerToast('Service added');
        this.newServiceName = '';
        this.newServicePrice = null;
        this.newServiceIcon = '';
        this.loadServices();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to add service';
        this.triggerToast(msg, 'error');
      }
    });
  }

  // Admin: Delete service
  deleteService(service: any) {
    if (!this.isAdmin) return;

    const id = String(service?._id || service?.id || '');
    if (!id) {
      this.triggerToast('Invalid service id', 'error');
      return;
    }

    if (!confirm(`Delete service "${service?.name}"?`)) return;

    this.apiService.delete(`/services/${id}`).subscribe({
      next: () => {
        this.selectedServices = this.selectedServices.filter(s => String(s?._id || s?.id) !== id);
        this.triggerToast('Service deleted');
        this.loadServices();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to delete service';
        this.triggerToast(msg, 'error');
      }
    });
  }

  loadCustomers() {
    this.apiService.get<any[]>('/customers/all').subscribe({
      next: d => this.customers = d || [],
      error: () => this.triggerToast('Failed to load customers', 'error')
    });
  }

  get totalAmount() {
    return (this.selectedServices || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  }

  toggleService(service: any) {
    const key = String(service?._id || service?.id);
    const i = this.selectedServices.findIndex(s => String(s?._id || s?.id) === key);
    if (i > -1) this.selectedServices.splice(i, 1);
    else this.selectedServices.push(service);
  }

  onPopupOpen(args: PopupOpenEventArgs): void { args.cancel = true; }

  triggerToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  private resetBookingDetails() {
    this.location = '';
    this.notes = '';
    this.selectedTime = null;
  }

  /**
   * Combine selected calendar date (Date object) with a time string like "08:30 AM"
   * into an ISO string. Uses local time.
   */
  private combineDateAndTime(dateObj: Date, timeLabel: string): string | null {
    if (!dateObj || !timeLabel) return null;

    const parsed = this.parseTimeLabel(timeLabel);
    if (!parsed) return null;

    const d = new Date(dateObj);
    d.setHours(parsed.hours, parsed.minutes, 0, 0);

    return d.toISOString();
  }

  /**
   * Parses "hh:mm AM/PM" into 24h hours/minutes.
   */
  private parseTimeLabel(label: string): { hours: number; minutes: number } | null {
    const raw = (label || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;

    let hh = Number(m[1]);
    const mm = Number(m[2]);
    const ap = String(m[3]).toUpperCase();

    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    if (hh < 1 || hh > 12) return null;
    if (mm < 0 || mm > 59) return null;

    if (ap === 'AM') {
      if (hh === 12) hh = 0;
    } else { // PM
      if (hh !== 12) hh += 12;
    }
    return { hours: hh, minutes: mm };
  }
}
