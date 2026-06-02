import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityMonitorService {
  private timeoutId: any;
  // 10 minutes in milliseconds (10 * 60 * 1000)
  private readonly INACTIVITY_TIME = 10 * 60 * 1000; 

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private ngZone: NgZone
  ) {}

  // Call this method when the application starts (e.g., in app.component.ts)
  public startMonitoring(): void {
    // Run outside Angular's change detection zone to prevent constant UI rerendering
    this.ngZone.runOutsideAngular(() => {
      const activityEvents = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      activityEvents.forEach(event => {
        window.addEventListener(event, () => this.resetTimer());
      });
    });

    this.startTimer();
  }

  private startTimer(): void {
    this.timeoutId = setTimeout(() => {
      // Bring execution back into Angular's zone to safely manipulate routes
      this.ngZone.run(() => {
        this.handleAutoLogout();
      });
    }, this.INACTIVITY_TIME);
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.startTimer();
  }

  private handleAutoLogout(): void {
    console.warn("Session expired due to inactivity.");
    
    // 1. Wipe out active local storage authentication data arrays
    this.apiService.clearLoginData(); // Or however you clear tokens in ApiService
    localStorage.clear();
    sessionStorage.clear();

    // 2. Route user back to authentication landing pad
    alert("Your session has expired due to inactivity. Please log in again.");
    this.router.navigate(['/login']);
  }
}