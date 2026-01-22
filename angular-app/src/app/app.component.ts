import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { SideNavbarComponent } from './navbar/side-navbar/side-navbar.component';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './service/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, SideNavbarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
  constructor(public apiService: ApiService) {}
}
