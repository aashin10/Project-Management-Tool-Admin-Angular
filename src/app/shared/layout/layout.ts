import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { SidebarHome } from '../../sidebar/sidebar-home/sidebar-home';
import { Table } from '../table/table';

@Component({
  selector: 'app-layout',
  imports: [Navbar, SidebarHome, RouterOutlet,Table],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
