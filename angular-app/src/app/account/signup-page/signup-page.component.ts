import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from '../../service/api.service';
import { Router, RouterLink } from "@angular/router";
import { NgIf, NgClass } from "@angular/common";

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass,],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  public form: FormGroup;
  public isStaff: boolean = false;
  public isLoading: boolean = false;

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmedPassword: ["", [Validators.required]],
      role: ['CUSTOMER'],
      ssn: [""],
      dob: [""],
      bankRoutingNo: [""],
      bankAccountNumber: [""]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmedPassword')?.value
      ? null : { 'mismatch': true };
  }

  toggleUserType(staffStatus: boolean) {
    this.isStaff = staffStatus;
    this.form.patchValue({ role: this.isStaff ? 'STAFF' : 'CUSTOMER' });

    const staffFields = ['ssn', 'dob', 'bankRoutingNo', 'bankAccountNumber'];
    if (this.isStaff) {
      staffFields.forEach(f => this.form.get(f)?.setValidators([Validators.required]));
    } else {
      staffFields.forEach(f => this.form.get(f)?.clearValidators());
    }
    this.form.updateValueAndValidity();
  }

  submitSignUp() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = { ...this.form.value };
    delete payload.confirmedPassword;

    this.apiService.post<any>("/api/auth/signup", payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert("Success! Profile created.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        alert("Signup failed: " + (err.error?.message || "Server Error"));
      }
    });
  }
}
