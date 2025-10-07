import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teaminfo.html',
  styleUrl: './teaminfo.css'
})
export class TeamOrganizationComponent {
  @Input() manager: string = '';
  @Input() deliveryUnit: string = '';

  @Output() managerChange = new EventEmitter<string>();
  @Output() deliveryUnitChange = new EventEmitter<string>();
}
