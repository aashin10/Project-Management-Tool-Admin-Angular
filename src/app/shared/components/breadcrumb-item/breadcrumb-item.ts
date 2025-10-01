// breadcrumb.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  url: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb-item.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class BreadcrumbItem {
  @Input() items: BreadcrumbItem[] = [];
}
