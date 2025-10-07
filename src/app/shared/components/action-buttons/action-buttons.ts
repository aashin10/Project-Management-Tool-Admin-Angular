import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell, Settings, User } from 'lucide-angular';

export type ActionType = 'notification' | 'setting' | 'profile';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './action-buttons.html',
})
export class ActionButtons {
  @Output() actionClick = new EventEmitter<string>();

  buttons = [
    { type: 'notification', label: 'Notifications', icon: '/images/notification.svg' },
    {
      type: 'profile',
      label: 'Profile',
      icon: '/images/profile.svg',
    },
  ];

  onAction(type: string): void {
    this.actionClick.emit(type);
  }
}
