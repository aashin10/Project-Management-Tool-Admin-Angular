import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { SidebarHome } from '../../sidebar/sidebar-home/sidebar-home';

@Component({
  selector: 'app-layout',
  imports: [Navbar, SidebarHome, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
