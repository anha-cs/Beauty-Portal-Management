import { Routes } from '@angular/router';
import { LoginPageComponent } from './account/login-page/login-page.component';
import { VisitorDashboardComponent } from './visitor-dashboard/visitor-dashboard.component';
import { SignupPageComponent } from './account/signup-page/signup-page.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './account/reset-password/reset-password.component';
import { StaffInformationComponent } from './staff-information/staff-information.component';
import { CustomerInfoComponent } from './customer-information/customer-info.component';
import { NewAppointmentComponent } from './new-appointment/new-appointment.component';
import { AppointmentRecordsComponent } from './appointment-records/appointment-records.component';
import { SystemReportComponent } from './system-reports/system-reports.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'dashboard', component: VisitorDashboardComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'staff-info', component: StaffInformationComponent },
  { path: 'customer-info', component: CustomerInfoComponent },
  { path: 'staff-info', component: StaffInformationComponent },
  { path: 'new-appointment', component: NewAppointmentComponent },
  { path: 'appointment-records', component: AppointmentRecordsComponent },
  { path: 'system-reports', component: SystemReportComponent }

];
