import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-single-section',
  imports: [CommonModule],
  templateUrl: './sidebar-single-section.html',
  styleUrl: './sidebar-single-section.css'
})
export class SidebarSingleSection {
  @Input() icon: string = '';
  @Input() label: string = '';

  constructor() {}

  

}
