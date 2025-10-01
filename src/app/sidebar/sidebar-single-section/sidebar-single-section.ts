import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar-single-section',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar-single-section.html',
  styleUrl: './sidebar-single-section.css'
})
export class SidebarSingleSection {
  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() route: string = '';

  constructor() {}
}
