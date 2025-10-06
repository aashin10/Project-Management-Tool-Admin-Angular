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
  @Output() actionClick = new EventEmitter<ActionType>();
  buttons = [
    { type: 'notification', label: 'Notifications', icon: Bell },
    { type: 'setting', label: 'Settings', icon: Settings },
    { type: 'profile', label: 'Profile', icon: User },
  ];
 
  onAction(type: ActionType): void {
    this.actionClick.emit(type);
  }
}