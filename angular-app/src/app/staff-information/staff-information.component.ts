import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../service/staff.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-staff-information',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './staff-information.component.html',
  styleUrls: ['./staff-information.component.css']
})
export class StaffInformationComponent implements OnInit {
  staffs: any[] = [];
  myProfile: any = null;
  isAdmin: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private staffService: StaffService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.loadData();
  }

  private checkRole(): void {
    const role = localStorage.getItem('role') || '';
    // Checks for 'ADMIN' or 'ROLE_ADMIN'
    this.isAdmin = role.toUpperCase().includes('ADMIN');
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isAdmin) {
      // FIX: Use the Executive endpoint to get SSN and Bank info
      this.staffService.getAdminStaffDetails().subscribe({
        next: (data: any[]) => {
          console.log('Executive Data Received:', data);
          this.staffs = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Admin Fetch Error:', err);
          this.errorMessage = 'Executive Access Denied. Please verify admin credentials.';
          this.isLoading = false;
        }
      });
    } else {
      this.staffService.getMyProfile().subscribe({
        next: (data: any) => {
          this.myProfile = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Profile Fetch Error:', err);
          this.errorMessage = 'Could not load your artist profile.';
          this.isLoading = false;
        }
      });
    }
  }
}
