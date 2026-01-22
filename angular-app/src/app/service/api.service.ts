import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  private loginStatus = new Subject<void>();
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token');

    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const userRole = localStorage.getItem('role');
    if (!userRole) return false;
    const normalizedRole = userRole.toUpperCase().replace('ROLE_', '');
    const targetRole = role.toUpperCase().replace('ROLE_', '');
    return normalizedRole === targetRole;
  }

  getUserId(): string {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') return '';
    try {
      const user = JSON.parse(userStr);
      // If id/id_ is missing, use email as a fallback unique identifier
      const id = user.id || user._id || user.email || '';
      return id.toString();
    } catch (e) {
      return '';
    }
  }

  getUserName(): string {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') return 'Guest';
    try {
      const user = JSON.parse(userStr);
      return user.firstName || 'Guest';
    } catch (e) {
      return 'Guest';
    }
  }

  getUserEmail(): string {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') return '';
    try {
      const user = JSON.parse(userStr);
      return user.email || '';
    } catch (e) {
      return '';
    }
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) {
      return `http://localhost:8080${url}`;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  // --- GENERIC HTTP METHODS ---

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), { headers: this.getHeaders() });
  }

  /**
   * UPDATED: Accepts an optional options object.
   * Usage: this.apiService.post('/url', body, { responseType: 'text' })
   */
  post<T>(url: string, body: any, options: any = {}): Observable<T> {
    let headers = this.getHeaders();

    // If we expect text, remove the JSON Content-Type
    if (options.responseType === 'text') {
      headers = headers.delete('Content-Type');
    }

    // Use (this.http.post(...) as any) to prevent the "HttpEvent" type error
    return this.http.post(this.buildUrl(url), body, {
      headers: headers,
      ...options
    }) as Observable<T>;
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body, { headers: this.getHeaders() });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), { headers: this.getHeaders() });
  }

  // --- AUTH MANAGEMENT ---

  toggleLogin() {
    this.loginStatus.next();
  }

  setLoginData(token: string, role: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    this.toggleLogin();
  }

  logout() {
    localStorage.clear();
    this.toggleLogin();
  }
}
