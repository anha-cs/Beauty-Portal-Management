import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../service/api.service';
import { NgOptimizedImage, NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, NgIf, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  // Signals ONLY for the left-side navigation sidebar
  @Output() sidebarToggle = new EventEmitter<void>();

  // Independent state for the top-right logout dropdown
  isLogoutMenuOpen = false;

  public userRole: string | null = null;

  constructor(public apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.updateNavbar();

    // Explicitly type the subscription to avoid TS7006
    this.apiService.loginStatus$.subscribe({
      next: (status: any) => this.updateNavbar(),
      error: (err: any) => console.error(err)
    });
  }

  updateNavbar(): void {
    if (typeof window !== 'undefined') {
      this.userRole = localStorage.getItem('user_role');
    }
  }

  get isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/signup';
  }

  /**
   * Toggles the Sidebar (Hamburger button)
   */
  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  /**
   * Toggles the Logout Dropdown (Profile button)
   */
  toggleLogoutMenu(): void {
    this.isLogoutMenuOpen = !this.isLogoutMenuOpen;
  }

  handleLogout(): void {
    this.apiService.logout();
    this.isLogoutMenuOpen = false;
    this.router.navigate(['/login']);
  }
}
