import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../service/api.service';

type RangeMode = 'WEEK' | 'MONTH';

type StaffSummaryRow = {
  staffId: string;
  staffName: string;
  apptCount: number;
  doneCount: number;
  revenueDone: number;
  topServices: Array<{ name: string; count: number }>;
};

@Component({
  selector: 'app-system-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-reports.component.html',
  styleUrl: './system-reports.component.css'
})
export class SystemReportComponent implements OnInit {
  isAdmin = false;
  isStaff = false;

  loading = true;
  errorMsg = '';

  records: any[] = []; // non-block only
  blocks: any[] = [];
  services: any[] = [];

  cards: Array<{ title: string; value: string; sub?: string; tone?: 'dark' | 'light' | 'pink' }> = [];
  upcoming: any[] = [];

  // ✅ Admin-only: fill missing staffName from staff list
  private staffNameById: Record<string, string> = {};

  // ✅ Admin-only staff performance section
  adminRange: RangeMode = 'WEEK';
  adminStaffRows: StaffSummaryRow[] = [];

  constructor(public apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isAdmin = this.apiService.hasRole('ADMIN');
    this.isStaff = this.apiService.hasRole('STAFF');

    if (!this.isAdmin && !this.isStaff) {
      this.loading = false;
      this.errorMsg = 'Access denied. Reports are available for Admin and Staff only.';
      return;
    }

    this.loadAll();
  }

  refresh() {
    this.loadAll();
  }

  setAdminRange(m: RangeMode) {
    this.adminRange = m;
    this.computeAdminStaffPerformance();
    this.cdr.detectChanges();
  }

  // -------------------------
  // Main load
  // -------------------------
  private loadAll() {
    this.loading = true;
    this.errorMsg = '';
    this.cards = [];
    this.upcoming = [];
    this.adminStaffRows = [];

    const blocksUrl = this.isAdmin ? '/appointments/blocks' : '/appointments/blocks/mine';

    if (this.isAdmin) {
      this.apiService.get<any[]>('/staff/all').subscribe({
        next: (staffs) => {
          this.staffNameById = this.buildStaffNameMap(staffs || []);
          this.loadRecordsThenRest(blocksUrl);
        },
        error: () => {
          this.staffNameById = {};
          this.loadRecordsThenRest(blocksUrl);
        }
      });
    } else {
      this.staffNameById = {};
      this.loadRecordsThenRest(blocksUrl);
    }
  }

  private loadRecordsThenRest(blocksUrl: string) {
    this.apiService.get<any[]>('/appointments/records').subscribe({
      next: (recs) => {
        this.records = (recs || []).map(r => this.normalizeRecord(r));

        this.apiService.get<any[]>(blocksUrl).subscribe({
          next: (blks) => {
            this.blocks = (blks || []).map(b => ({ ...b, _dt: this.safeDate(b?.dateTime) }));

            this.apiService.get<any[]>('/services/all').subscribe({
              next: (svcs) => {
                this.services = svcs || [];
                this.computeCards();
                this.computeAdminStaffPerformance(); // ✅ new
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.services = [];
                this.computeCards();
                this.computeAdminStaffPerformance();
                this.loading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.blocks = [];
            this.services = [];
            this.computeCards();
            this.computeAdminStaffPerformance();
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error || 'Failed to load report data.';
        this.cdr.detectChanges();
      }
    });
  }

  // -------------------------
  // Normalize / staffName fix
  // -------------------------
  private normalizeRecord(r: any) {
    const dt = this.safeDate(r?.dateTime);
    const staffId = String(r?.staffId?._id || r?.staffId || '');
    const staffNameFromDb = String(r?.staffName || '').trim();

    const staffNameFixed =
      staffNameFromDb ||
      (staffId && this.staffNameById[staffId]) ||
      '';

    return {
      ...r,
      staffId,
      staffName: staffNameFixed,
      _dt: dt,
      _price: Number(r?.price || 0),
      _status: String(r?.status || '').toUpperCase()
    };
  }

  private buildStaffNameMap(staffs: any[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const s of staffs || []) {
      const id = String(s?._id || s?.id || '');
      const name = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim() || s?.firstName || '';
      if (id) map[id] = name;
    }
    return map;
  }

  // -------------------------
  // Cards + upcoming
  // -------------------------
  private computeCards() {
    const now = new Date();

    const startToday = this.startOfDay(now);
    const endToday = this.endOfDay(now);

    const startWeek = this.startOfWeek(now);
    const endWeek = this.endOfDay(this.addDays(startWeek, 6));

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const recs = (this.records || []).filter(r => r._dt instanceof Date && !isNaN(r._dt.getTime()));

    const todayRecs = recs.filter(r => r._dt >= startToday && r._dt <= endToday);
    const weekRecs = recs.filter(r => r._dt >= startWeek && r._dt <= endWeek);
    const monthRecs = recs.filter(r => r._dt >= startMonth && r._dt <= endMonth);

    const bookedToday = todayRecs.filter(r => r._status !== 'CANCELLED');
    const bookedMonth = monthRecs.filter(r => r._status !== 'CANCELLED');

    const doneToday = todayRecs.filter(r => r._status === 'DONE');
    const cancelledWeek = weekRecs.filter(r => r._status === 'CANCELLED');
    const cancelledMonth = monthRecs.filter(r => r._status === 'CANCELLED');

    const bookedRevenueToday = this.sum(bookedToday.map(r => r._price));
    const bookedRevenueMonth = this.sum(bookedMonth.map(r => r._price));

    const doneMonth = monthRecs.filter(r => r._status === 'DONE');
    const completedRevenueMonth = this.sum(doneMonth.map(r => r._price));

    const avgTicketMonth = bookedMonth.length ? bookedRevenueMonth / bookedMonth.length : 0;

    const monthBlocks = (this.blocks || []).filter(b => b._dt >= startMonth && b._dt <= endMonth);

    // Upcoming 7 days
    const startNow = new Date();
    const end7 = this.addDays(startNow, 7);

    this.upcoming = recs
      .filter(r => r._dt >= startNow && r._dt <= end7 && r._status !== 'CANCELLED')
      .sort((a, b) => a._dt.getTime() - b._dt.getTime())
      .slice(0, 8);

    const roleLabel = this.isAdmin ? 'Admin' : 'Staff';

    this.cards = [
      {
        title: `${roleLabel} • Appointments Today`,
        value: String(todayRecs.length),
        sub: `${doneToday.length} done • ${todayRecs.filter(r => r._status === 'PENDING').length} pending`,
        tone: 'dark'
      },
      {
        title: 'This Week',
        value: String(weekRecs.length),
        sub: `${cancelledWeek.length} cancelled`,
        tone: 'light'
      },
      {
        title: 'This Month',
        value: String(monthRecs.length),
        sub: `${cancelledMonth.length} cancelled`,
        tone: 'light'
      },
      {
        title: 'Booked Revenue (Today)',
        value: this.money(bookedRevenueToday),
        sub: 'PENDING + DONE (excludes cancelled)',
        tone: 'pink'
      },
      {
        title: 'Booked Revenue (Month)',
        value: this.money(bookedRevenueMonth),
        sub: `Avg ticket: ${this.money(avgTicketMonth)}`,
        tone: 'light'
      },
      {
        title: 'Completed Revenue (Month)',
        value: this.money(completedRevenueMonth),
        sub: 'DONE only',
        tone: 'light'
      },
      {
        title: 'Blocked Days (This Month)',
        value: String(monthBlocks.length),
        sub: this.isAdmin ? 'All staff' : 'My schedule',
        tone: 'light'
      },
      {
        title: 'Upcoming (Next 7 Days)',
        value: String(this.upcoming.length),
        sub: 'Non-cancelled appointments',
        tone: 'light'
      },
      {
        title: 'Active Services',
        value: String((this.services || []).length),
        sub: 'From services catalog',
        tone: 'light'
      }
    ];
  }

  // -------------------------
  // ✅ Admin staff performance
  // -------------------------
  private computeAdminStaffPerformance() {
    if (!this.isAdmin) {
      this.adminStaffRows = [];
      return;
    }

    const now = new Date();
    const startWeek = this.startOfWeek(now);
    const endWeek = this.endOfDay(this.addDays(startWeek, 6));

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const from = this.adminRange === 'WEEK' ? startWeek : startMonth;
    const to = this.adminRange === 'WEEK' ? endWeek : endMonth;

    const rows = (this.records || [])
      .filter(r => r._dt instanceof Date && !isNaN(r._dt.getTime()))
      .filter(r => r._dt >= from && r._dt <= to)
      .filter(r => r._status !== 'CANCELLED'); // ignore cancelled from service counts

    const staffMap = new Map<string, StaffSummaryRow>();

    for (const a of rows) {
      const staffId = String(a.staffId || '');
      const staffName = String(a.staffName || this.staffNameById[staffId] || '—');

      if (!staffId) continue;

      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staffId,
          staffName,
          apptCount: 0,
          doneCount: 0,
          revenueDone: 0,
          topServices: []
        });
      }

      const s = staffMap.get(staffId)!;
      s.apptCount += 1;

      if (a._status === 'DONE') {
        s.doneCount += 1;
        s.revenueDone += Number(a._price || 0);
      }

      // service count (PENDING + DONE)
      const svcName = String(a.serviceName || 'Service');
      const existing = s.topServices.find(x => x.name === svcName);
      if (existing) existing.count += 1;
      else s.topServices.push({ name: svcName, count: 1 });
    }

    // sort top services and keep top 3
    const result = Array.from(staffMap.values()).map(r => ({
      ...r,
      topServices: r.topServices.sort((a, b) => b.count - a.count).slice(0, 3)
    }));

    // sort staff by revenue desc, then appts
    result.sort((a, b) => {
      const rev = b.revenueDone - a.revenueDone;
      if (rev !== 0) return rev;
      return b.apptCount - a.apptCount;
    });

    this.adminStaffRows = result;
  }

  // -------------------------
  // UI helpers
  // -------------------------
  formatDateTime(v: any): string {
    const d = this.safeDate(v);
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.toLocaleString();
  }

  money(n: number): string {
    const x = Number(n || 0);
    return x.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  // -------------------------
  // Date helpers
  // -------------------------
  private safeDate(v: any): Date {
    return new Date(v);
  }

  private sum(nums: number[]): number {
    return (nums || []).reduce((a, b) => a + (Number(b) || 0), 0);
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  }

  private startOfWeek(d: Date): Date {
    const x = this.startOfDay(d);
    const day = x.getDay(); // 0 Sun, 1 Mon...
    const diff = (day === 0 ? -6 : 1) - day; // Monday
    x.setDate(x.getDate() + diff);
    return x;
  }
}
