import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from '../../service/api.service';
import { Router, RouterLink } from "@angular/router";
import { NgIf, NgClass } from "@angular/common";
import { AuthTimeoutService } from '../../auth-timeout.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  public form: FormGroup;
  public invalidCredentials = false;
  public isLoading = false;
  
  // 👁️ Properties to handle the password visibility eye toggle feature
  public showPasswordValue: boolean = false;

  constructor(
    private apiService: ApiService, 
    private router: Router, 
    private fb: FormBuilder,
    private authTimeoutService: AuthTimeoutService // 1. Inject the timeout service here
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // 👁️ Method to alternate password view state
  public togglePasswordVisibility(): void {
    this.showPasswordValue = !this.showPasswordValue;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.invalidCredentials = false;

    this.apiService.post<any>("/auth/login", this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        // res contains token, role, and user fields (id, firstName)
        this.apiService.setLoginData(res.token, res.role, res);

        // 2. Start tracking inactivity the moment login data is verified and saved
        this.authTimeoutService.startTracking();

        const role = res.role.toUpperCase().replace('ROLE_', '');
        if (role === 'ADMIN' || role === 'STAFF') {
          this.router.navigate(['/staff-info']);
        } else {
          this.router.navigate(['/customer-info']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.invalidCredentials = true;
      },
    });
  }
}