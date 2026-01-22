import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private api: ApiService) { }

  /**
   * Fetches the general list of staff members.
   * Usually used for public displays or basic directories.
   * Endpoint: GET /api/staff/all
   */
  getAllStaffs(): Observable<any[]> {
    return this.api.get<any[]>('/staff/all');
  }

  /**
   * Fetches the profile of the currently logged-in staff member.
   * Endpoint: GET /api/staff/me
   */
  getMyProfile(): Observable<any> {
    return this.api.get<any>('/staff/me');
  }

  /**
   * Fetches full sensitive details of all staff members.
   * Required for the Admin Executive Directory to see SSN and Bank info.
   * Endpoint: GET /api/staff/admin/all
   */
  getAdminStaffDetails(): Observable<any[]> {
    return this.api.get<any[]>('/staff/admin/all');
  }

  /**
   * Updates a staff member's information (Admin only)
   * @param id The staff ID
   * @param data The updated staff object
   */
  updateStaff(id: string, data: any): Observable<any> {
    return this.api.put<any>(`/staff/${id}`, data);
  }

  /**
   * Deletes a staff member (Admin only)
   * @param id The staff ID
   */
  deleteStaff(id: string): Observable<any> {
    return this.api.delete<any>(`/staff/${id}`);
  }

  addService(serviceData: any): Observable<any> {
    return this.api.post<any>('/services/add', serviceData);
  }

  deleteService(serviceId: string): Observable<any> {
    return this.api.delete<any>(`/services/${serviceId}`);
  }
}
