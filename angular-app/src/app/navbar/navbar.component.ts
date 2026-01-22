import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../service/api.service';
import { NgOptimizedImage, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  public userRole: string | null = null;

  constructor(public apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.updateNavbar();
    // Re-check whenever the login status changes
    this.apiService.loginStatus$.subscribe(() => {
      this.updateNavbar();
    });
  }

  updateNavbar() {
    this.userRole = localStorage.getItem('user_role');
  }

  // This check handles whether we are currently on the Auth pages
  get isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/signup';
  }

  handleLogout() {
    // 1. Clear the data
    this.apiService.logout();

    // 2. Redirect the user
    this.router.navigateByUrl('/login').then(() => {
      // 3. Optional: refresh the view if needed
      window.location.reload();
    });
  }
}
