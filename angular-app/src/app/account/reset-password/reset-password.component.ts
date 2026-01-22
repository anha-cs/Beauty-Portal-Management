import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmedPassword = '';
  token = '';
  passwordValid = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  validatePassword(): void {
    this.passwordValid = this.password.length >= 8;
  }

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.passwordValid) {
      this.errorMessage = 'Please choose a stronger password.';
      return;
    }

    if (this.password !== this.confirmedPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    const payload = {
      token: this.token,
      newPassword: this.password
    };

    this.http.post('http://localhost:8080/api/auth/reset-password', payload)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = 'Password updated successfully! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'An error occurred.';
        }
      });
  }
}
