import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../../service/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent implements OnInit {
  currentRoute: string = '';

  constructor(public apiService: ApiService, private router: Router) {
    // Listen for URL changes to update the pink active indicator
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const path = event.urlAfterRedirects.split('/');
      this.currentRoute = path[path.length - 1];
    });
  }

  ngOnInit() {
    // Set initial route on page load
    const path = this.router.url.split('/');
    this.currentRoute = path[path.length - 1] || '';
  }

  /**
   * Getter for the Role string shown in the profile card
   */
  get userRole(): string {
    return localStorage.getItem('role') || 'GUEST';
  }

  /**
   * Getter for the Initial (e.g., "C" or "S") shown in the avatar box
   */
  get userInitial(): string {
    return this.userRole.charAt(0).toUpperCase();
  }

  navigate(route: string) {
    this.router.navigate([`/${route}`]);
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}
