import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {
  // Data containers
  customers: any[] = [];
  myProfile: any = null;

  // State tracking
  isAdmin: boolean = false;
  isStaff: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  // Modal State Variables
  showNoteModal: boolean = false;
  tempNote: string = '';
  selectedCustomer: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.isAdmin = this.apiService.hasRole('ADMIN');
    this.isStaff = this.apiService.hasRole('STAFF');
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isAdmin || this.isStaff) {
      this.apiService.get('/api/customers/all').subscribe({
        next: (data: any) => {
          this.customers = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.errorMessage = "Unable to load client directory.";
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.get('/api/customers/profile').subscribe({
        next: (data: any) => {
          this.myProfile = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.errorMessage = "Could not retrieve your personal profile.";
          this.isLoading = false;
        }
      });
    }
  }

  updateNotes(customer: any) {
    this.selectedCustomer = customer;
    this.tempNote = customer.notes || '';
    this.showNoteModal = true;
  }

  confirmNoteUpdate() {
    if (!this.selectedCustomer) return;

    this.isLoading = true;
    this.errorMessage = ''; // Clear old errors

    // Fix: Ensure we use the correct ID property from your MongoDB/Java object
    const userId = this.selectedCustomer.id || this.selectedCustomer._id;

    if (!userId) {
      this.isLoading = false;
      this.errorMessage = "User ID not found. Cannot update.";
      return;
    }

    this.apiService.put(`/api/customers/${userId}/notes`, { notes: this.tempNote }).subscribe({
      next: (response: any) => {
        // Success logic
        this.selectedCustomer.notes = this.tempNote;
        this.showNoteModal = false;
        this.isLoading = false;
        this.selectedCustomer = null; // Reset selection
        console.log("Notes updated successfully in DB and UI");
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Update Error details:", err);
        this.errorMessage = "Failed to update notes. Check your internet or login status.";
      }
    });
  }

  closeModal() {
    this.showNoteModal = false;
    this.tempNote = '';
    this.selectedCustomer = null;
    this.errorMessage = ''; // Clear error when closing
  }
}
