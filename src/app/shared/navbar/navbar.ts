import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarHome } from '../../sidebar/sidebar-home/sidebar-home';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
