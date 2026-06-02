import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { SideNavbarComponent } from './navbar/side-navbar/side-navbar.component';
import { InactivityMonitorService } from './service/inactivity-monitor.service'; // Adjust path if needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, NgIf, NavbarComponent, SideNavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public isSideNavOpen: boolean = false;

  // Inject the global idle engine monitor through the constructor
  constructor(private inactivityMonitor: InactivityMonitorService) {}

  ngOnInit(): void {
    // Start tracking user activity clicks/mouse strokes immediately on app boot
    this.inactivityMonitor.startMonitoring();
  }

  toggleSidebar(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
  }
}