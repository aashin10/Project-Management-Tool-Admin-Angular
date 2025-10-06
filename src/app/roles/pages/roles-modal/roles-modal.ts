import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './roles-modal.html',
  styleUrl: './roles-modal.css'
})
export class RolesModal {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  role = {
    name: '',
    description: '',
    cloneFrom: '',
    permissions: [] as string[]
  };

  permissionsList = [
    'Sprint Creation',
    'Admin to Admin Creation',
    'View Private Tickets'
  ];

  togglePermission(permission: string) {
    if (this.role.permissions.includes(permission)) {
      this.role.permissions = this.role.permissions.filter(p => p !== permission);
    } else {
      this.role.permissions.push(permission);
    }
  }

  submit() {
    this.create.emit(this.role);
    this.close.emit();
  }
}
