import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `${environment.apiUrl}/api`;

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

  /**
   * Builds the full URL dynamically based on the environment.
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http')) return url;

    if (url.startsWith('/api')) {
      return `${environment.apiUrl}${url}`;
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  // --- GENERIC HTTP METHODS ---

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), { headers: this.getHeaders() });
  }

  post<T>(url: string, body: any, options: any = {}): Observable<T> {
    let headers = this.getHeaders();

    if (options.responseType === 'text') {
      headers = headers.delete('Content-Type');
    }

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
