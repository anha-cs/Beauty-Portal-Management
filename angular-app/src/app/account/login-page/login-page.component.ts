import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from '../../service/api.service';
import { Router, RouterLink } from "@angular/router";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  public form: FormGroup;
  public invalidCredentials = false;
  public isLoading = false;

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.invalidCredentials = false;

    this.apiService.post<any>("/auth/login", this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        // res contains token, role, and user fields (id, firstName)
        this.apiService.setLoginData(res.token, res.role, res);

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
