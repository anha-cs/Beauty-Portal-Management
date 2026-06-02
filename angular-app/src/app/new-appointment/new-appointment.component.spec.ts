import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent, ScheduleModule, MonthService } from '@syncfusion/ej2-angular-schedule';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleModule],
  providers: [MonthService],
  templateUrl: './new-appointment.component.html',
  styleUrls: ['./new-appointment.component.css']
})
export class NewAppointmentComponent implements OnInit {
  @ViewChild('scheduleObj') public scheduleObj!: ScheduleComponent;

  // Existing View & Mode States
  isStaff: boolean = false;
  isAdmin: boolean = false;
  isBlockMode: boolean = false;

  // Toast Control
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';
  toastMessage: string = '';

  // Data Collections
  allStaffRaw: any[] = [];
  selectedStaff: any = null;
  customers: any[] = [];
  selectedCustomer: any = null;
  services: any[] = [];
  selectedServices: any[] = [];
  availableTimes: string[] = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  // Form Fields: Normal Booking
  selectedTime: string | null = null;
  location: string = '';
  notes: string = '';
  totalAmount: number = 0;

  // Form Fields: Staff Availability Day Blocks
  blockReason: string = 'Lunch Break';
  blockNotes: string = '';

  // Syncfusion Scheduler Configuration
  selectedSlots: any[] = [];
  public group: any = {};
  public eventSettings: any = {};
  public staffResourceData: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Initialization setup logic (e.g., loading staff profile roles and services)
  }

  // Layout Event Handlers
  onStaffChange(staff: any): void {
    this.selectedStaff = staff;
  }

  toggleService(svc: any): void {
    const index = this.selectedServices.indexOf(svc);
    if (index >= 0) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(svc);
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  }

  // Syncfusion Cell Interactivity Elements
  onCellClick(event: any): void {
    // Populating selected cells to selectedSlots tracking array
    this.selectedSlots = [{ date: event.startTime }];
  }

  onRenderCell(event: any): void {}
  onPopupOpen(event: any): void {}

  // Central Core Submission Method
  submitAction(): void {
    if (this.selectedSlots.length === 0) {
      this.showToastMessage('Please select a date on the calendar.', 'error');
      return;
    }

    if (this.isBlockMode) {
      // ----------------------------------------------------
      // FLOW A: BLOCK OUT DAY LOGIC (NO EMAIL SENT)
      // ----------------------------------------------------
      
      // Map out block objects across all selected calendar cells
      const blocksToSave = this.selectedSlots.map(slot => {
        return {
          isBlock: true,
          status: 'BLOCKED',
          staffId: this.selectedStaff ? this.selectedStaff.id : null,
          serviceName: 'Unavailable',
          customerName: 'N/A (Staff Block)',
          notes: this.blockNotes || this.blockReason,
          startTime: slot.date,
          endTime: slot.date
        };
      });

      // TODO: Loop or post the batch payload to your updated endpoint:
      // this.apiService.post('/api/appointments/book', blocksToSave[0]).subscribe(...)
      
      this.showToastMessage('Schedule blocked successfully!', 'success');
      this.resetForm();

    } else {
      // ----------------------------------------------------
      // FLOW B: NORMAL CUSTOMER APPOINTMENT BOOKING
      // ----------------------------------------------------
      if (!this.selectedTime) {
        this.showToastMessage('Please pick an appointment time.', 'error');
        return;
      }
      if (this.selectedServices.length === 0) {
        this.showToastMessage('Please select at least one service.', 'error');
        return;
      }

      const appointmentPayload = {
        isBlock: false,
        status: 'PENDING',
        staffId: this.selectedStaff ? this.selectedStaff.id : null,
        customerId: this.selectedCustomer ? this.selectedCustomer.id : null,
        notes: this.notes,
        location: this.location || 'Studio',
        startTime: this.selectedSlots[0].date
      };

      // TODO: Fire request payload to backend matching standard flows
      this.showToastMessage('Booking requested successfully!', 'success');
      this.resetForm();
    }
  }

  // Utilities & Cleaners
  showToastMessage(msg: string, type: 'success' | 'error'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  resetForm(): void {
    this.selectedSlots = [];
    this.selectedServices = [];
    this.selectedTime = null;
    this.notes = '';
    this.blockNotes = '';
    this.blockReason = 'Lunch Break';
    this.totalAmount = 0;
  }
}