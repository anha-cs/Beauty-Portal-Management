import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  emailValid: boolean = true;
  isEmailSent: boolean = false;

  constructor(private apiService: ApiService) {}

  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.emailValid = emailPattern.test(this.email);
  }

  sendForgotPasswordEmail() {
    if (this.emailValid && this.email) {
      this.apiService.post<any>("/auth/forgot-password", { email: this.email }).subscribe({
        next: () => {
          this.isEmailSent = true;
        },
        error: (err) => {
          const message = err.error?.message || "An unexpected error occurred.";
          alert(message);
        }
      });
    }
  }
}
