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

  public eventSettings: EventSettingsModel = { dataSource: [] };

  public selectedSlots: any[] = [];
  public currentStaffDbId = '';

  public toastMessage = '';
  public showToast = false;
  public toastType: 'success' | 'error' = 'success';

  public defaultIcons: string[] = ['✨', '👁️', '💅', '🦋', '💄', '🎀', '🧖‍♀️', '💆‍♀️', '💇‍♀️', '👰', '🤵‍♂️'];
  private defaultIconIndex = 0;

  public newServiceName = '';
  public newServicePrice: number | null = null;
  public newServiceIcon = '';

  public location = '';
  public notes = '';
  public selectedTime: string | null = null;

  // Track state properties for Schedule Availability Blocks
  public blockReason: string = 'Salon Closed';
  public blockNotes: string = '';

  public availableTimes: string[] = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  constructor(public apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.isAdmin = this.apiService.hasRole('ADMIN');
    this.isStaff = this.apiService.hasRole('STAFF');

    if (this.isStaff && !this.isAdmin) {
      this.isBlockMode = true;
      this.apiService.get<any>('/staff/me').subscribe({
        next: (me) => {
          this.currentStaffDbId = String(me?._id || me?.id || '');
          this.staffResourceData = [{ id: this.currentStaffDbId, text: me.firstName || 'Me', color: '#ec4899' }];
          this.loadBlockedDays();
          this.cdr.detectChanges();
        },
        error: () => this.triggerToast('Failed to load staff profile', 'error')
      });
      return;
    }

    this.apiService.get<any[]>('/staff/all').subscribe({
      next: (staffs) => {
        this.allStaffRaw = staffs || [];
        this.renderAllStaff(this.allStaffRaw);
        this.loadBlockedDays();
        this.loadServices();
        if (this.isAdmin) this.loadCustomers();
        this.cdr.detectChanges();
      }
    });
  }

  private renderAllStaff(staffs: any[]) {
    this.staffResourceData = (staffs || []).map(s => ({
      id: String(s._id || s.id), text: s.firstName, color: '#ec4899'
    }));
  }

  onStaffChange(staff: any) {
    if (this.isStaff && !this.isAdmin) return;
    this.selectedStaff = staff;
    this.selectedSlots = [];
    this.resetBookingDetails();
    if (!staff) this.renderAllStaff(this.allStaffRaw);
    else {
      this.staffResourceData = [{ id: String(staff._id || staff.id), text: staff.firstName, color: '#ec4899' }];
    }
    this.loadBlockedDays();
    this.scheduleObj?.refresh();
  }

  private getShownStaffIds(): string[] { return (this.staffResourceData || []).map(r => String(r.id)); }

  private getCellStaffId(groupIndex?: number): string {
    return this.staffResourceData?.length && groupIndex !== undefined ? String(this.staffResourceData[groupIndex]?.id || '') : String(this.currentStaffDbId || '');
  }

  loadBlockedDays() {
    const url = (this.isStaff && !this.isAdmin) ? '/appointments/blocks/mine' : '/appointments/blocks';
    this.apiService.get<any[]>(url).subscribe({
      next: (rows) => {
        const shown = this.getShownStaffIds();
        const mapped = (rows || []).filter(a => shown.includes(String(a.staffId?._id || a.staffId))).map(a => ({
          Id: String(a._id || a.id),
          Subject: 'UNAVAILABLE',
          StartTime: new Date(a.dateTime),
          EndTime: new Date(new Date(a.dateTime).getTime() + 86400000),
          IsAllDay: true,
          IsBlock: true,
          StaffId: String(a.staffId?._id || a.staffId)
        }));
        this.eventSettings = { dataSource: mapped };
        this.cdr.detectChanges();
        this.scheduleObj?.refresh();
      }
    });
  }

  onCellClick(args: CellClickEventArgs): void {
    args.cancel = true;
    if (!args.startTime) return;
    const cellStaffId = this.getCellStaffId(args.groupIndex);
    const data = (this.eventSettings.dataSource as any[]) || [];
    const existingBlock = data.find(e => new Date(e.StartTime).toDateString() === args.startTime!.toDateString() && e.IsBlock === true && String(e.StaffId) === String(cellStaffId));

    if (existingBlock) {
      if (confirm('Make this day available?')) {
        this.apiService.delete(`/appointments/${existingBlock.Id}`).subscribe({
          next: () => { this.triggerToast('Availability Restored'); this.loadBlockedDays(); }
        });
      }
      return;
    }

    this.selectedSlots = [{ id: new Date().getTime(), date: args.startTime, staffId: cellStaffId }];
    this.cdr.detectChanges();
  }

  onRenderCell(args: RenderCellEventArgs): void {
    if (args.elementType !== 'monthCells') return;

    const element = args.element as HTMLElement;
    const data = (this.eventSettings.dataSource as any[]) || [];
    
    const cellStaffId = this.getCellStaffId(args.groupIndex);
    const isBlocked = data.some(e =>
      new Date(e.StartTime).toDateString() === args.date!.toDateString() &&
      e.IsBlock === true &&
      String(e.StaffId) === String(cellStaffId)
    );

    if (isBlocked) {
      element.style.backgroundColor = '#cbd5e1'; 
      element.style.position = 'relative';
    } else {
      element.style.backgroundColor = ''; 
    }
  }

  submitAction() {
    // 1. Validate Date Selection (Required for both scheduling configurations)
    if (this.selectedSlots.length === 0) {
      this.triggerToast('Please select a date on the calendar.', 'error');
      return;
    }

    const slot = this.selectedSlots[0];

    if (this.isBlockMode) {
      // ------------------------------------------------------------------
      // FLOW A: APPLY FULL-DAY SCHEDULE BLOCK OUT (NO NOTIFICATIONS FIRED)
      // ------------------------------------------------------------------
      const blockPayload: any = {
        staffId: String(slot.staffId),
        serviceName: 'Unavailable',
        customerName: 'N/A (Staff Block)',
        dateTime: new Date(slot.date).toISOString(), 
        isBlock: true,
        status: 'BLOCKED',
        notes: this.blockNotes || this.blockReason,
        price: 0
      };

      this.apiService.post('/appointments/book', blockPayload).subscribe({
        next: () => {
          this.triggerToast('Day Block Applied Successfully');
          this.selectedSlots = [];
          this.resetBookingDetails();
          this.loadBlockedDays();
        },
        error: (err) => this.triggerToast(err?.error?.error || 'Failed to apply schedule block', 'error')
      });

    } else {
      // ------------------------------------------------------------------
      // FLOW B: MANDATORY APPOINTMENT DATA ENFORCEMENT
      // ------------------------------------------------------------------
      
      // Enforce Artist Staff Assignment Validation
      if (!slot.staffId || slot.staffId === 'undefined' || slot.staffId === '') {
        this.triggerToast('Please select a staff artist for this appointment.', 'error');
        return;
      }

      // Enforce Administrative Client Target Validation
      if (this.isAdmin && !this.selectedCustomer) {
        this.triggerToast('Please select a customer for this appointment.', 'error');
        return;
      }

      // Enforce Service Matrix Selection
      if (!this.selectedServices || this.selectedServices.length === 0) {
        this.triggerToast('Please select at least one service.', 'error');
        return;
      }

      // Enforce Hourly Timeframe Slot Choice
      if (!this.selectedTime) {
        this.triggerToast('Please pick an appointment time.', 'error');
        return;
      }

      // Enforce Geographic Location Text Constraints
      if (!this.location || this.location.trim() === '') {
        this.triggerToast('Please specify a location for the appointment.', 'error');
        return;
      }

      const dateTimeISO = this.combineDateAndTime(slot.date, this.selectedTime);
      
      const payload: any = {
        customerId: this.isAdmin ? String(this.selectedCustomer?._id || this.selectedCustomer?.id) : String(this.apiService.getUserId()),
        customerName: this.isAdmin ? `${this.selectedCustomer?.firstName} ${this.selectedCustomer?.lastName || ''}`.trim() : this.apiService.getUserName(),
        staffId: String(slot.staffId),
        serviceName: this.selectedServices.map(s => s.name).join(', '),
        dateTime: dateTimeISO,
        isBlock: false,
        status: 'PENDING',
        price: this.totalAmount,
        notes: this.notes,
        location: this.location.trim()
      };

      this.apiService.post('/appointments/book', payload).subscribe({
        next: () => {
          this.triggerToast('Booking Requested - Check your email!');
          this.selectedSlots = [];
          this.selectedServices = [];
          this.resetBookingDetails();
          this.loadBlockedDays();
        },
        error: (err) => this.triggerToast(err?.error?.error || 'Failed to book appointment', 'error')
      });
    }
  }

  loadServices() { this.apiService.get<any[]>('/services/all').subscribe(d => this.services = d || []); }

  addService() {
    const payload = { name: this.newServiceName, price: this.newServicePrice, icon: this.newServiceIcon || this.defaultIcons[0] };
    this.apiService.post('/services', payload).subscribe(() => this.loadServices());
  }

  deleteService(service: any) {
    this.apiService.delete(`/services/${String(service?._id || service?.id)}`).subscribe(() => this.loadServices());
  }

  loadCustomers() { this.apiService.get<any[]>('/customers/all').subscribe(d => this.customers = d || []); }

  get totalAmount() { return (this.selectedServices || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0); }

  toggleService(service: any) {
    const key = String(service?._id || service?.id);
    const i = this.selectedServices.findIndex(s => String(s?._id || s?.id) === key);
    i > -1 ? this.selectedServices.splice(i, 1) : this.selectedServices.push(service);
  }

  onPopupOpen(args: PopupOpenEventArgs): void { args.cancel = true; }

  triggerToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg; this.toastType = type; this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  resetBookingDetails() { 
    this.location = ''; 
    this.notes = ''; 
    this.selectedTime = null; 
    this.blockNotes = '';
    this.blockReason = 'Salon Closed';
  }

  private combineDateAndTime(dateObj: Date, timeLabel: string): string {
    const d = new Date(dateObj);
    const m = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      let hh = Number(m[1]);
      if (m[3].toUpperCase() === 'PM' && hh !== 12) hh += 12;
      else if (m[3].toUpperCase() === 'AM' && hh === 12) hh = 0;
      d.setHours(hh, Number(m[2]), 0, 0);
    }
    return d.toISOString();
  }
}