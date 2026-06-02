import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, switchMap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthTimeoutService {
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private timeoutSubscription?: Subscription;
  private readonly TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor() {
    // Automatically start tracking if a token already exists when the app boots up
    if (localStorage.getItem('token')) {
      this.startTracking();
    }
  }

  /**
   * Call this method right inside your Login component upon a successful login!
   */
  startTracking() {
    this.stopTracking(); // Clear any existing timers first

    // List of interaction events that prove the user is still active
    const activityEvents$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'click'),
      fromEvent(window, 'keypress'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart')
    );

    // Run outside Angular's zone so micro-movements (like mouse tracking) 
    // don't trigger unnecessary change detection cycles, keeping performance high.
    this.ngZone.runOutsideAngular(() => {
      this.timeoutSubscription = activityEvents$
        .pipe(
          // Every time an event fires, switchMap resets the countdown timer back to 10 minutes
          switchMap(() => timer(this.TIMEOUT_MS))
        )
        .subscribe(() => {
          // Timer finished without interruption! Run back inside Angular zone to update UI/routes
          this.ngZone.run(() => {
            this.logoutUser();
          });
        });
    });
  }

  /**
   * Call this when the user explicitly clicks "Logout" so we stop tracking events
   */
  stopTracking() {
    if (this.timeoutSubscription) {
      this.timeoutSubscription.unsubscribe();
    }
  }

  private logoutUser() {
    console.warn('Session expired due to 10 minutes of inactivity. Logging out...');
    this.stopTracking();
    localStorage.removeItem('token'); // Destroy session token
    this.router.navigate(['/login']);  // Kick back to login
  }
}