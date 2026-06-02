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
        this.cdr.detectChanges