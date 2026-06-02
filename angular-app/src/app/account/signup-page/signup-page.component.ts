import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from '../../service/api.service';
import { Router, RouterLink } from "@angular/router";
import { NgIf, NgClass } from "@angular/common";

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: './signup-page.component.html',
})
export class SignupPageComponent {
  public form: FormGroup;
  public isStaff: boolean = false;
  public isLoading: boolean = false;

  // Strong Password Regex: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      password: ["", [
        Validators.required, 
        Validators.minLength(8), // Bumped up from 6 to industry-standard 8
        Validators.pattern(this.passwordPattern)
      ]],
      confirmedPassword: ["", [Validators.required]],
      role: ['CUSTOMER'],
      ssn: [""],
      dob: [""],
      bankRoutingNo: [""],
      bankAccountNumber: [""]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmedPassword = g.get('confirmedPassword')?.value;
    
    if (password !== confirmedPassword) {
      g.get('confirmedPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  toggleUserType(staffStatus: boolean) {
    this.isStaff = staffStatus;
    this.form.patchValue({ role: this.isStaff ? 'STAFF' : 'CUSTOMER' });

    const staffFields = ['ssn', 'dob', 'bankRoutingNo', 'bankAccountNumber'];
    
    if (!this.isStaff) {
      staffFields.forEach(field => {
        const control = this.form.get(field);
        control?.setValue("");
        control?.clearValidators();
        control?.updateValueAndValidity({ emitEvent: false });
      });
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