import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { SideNavbarComponent } from './navbar/side-navbar/side-navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, NgIf, NavbarComponent, SideNavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isSideNavOpen = true;

  toggleSidebar() {
    this.isSideNavOpen = !this.isSideNavOpen;
  }
}
