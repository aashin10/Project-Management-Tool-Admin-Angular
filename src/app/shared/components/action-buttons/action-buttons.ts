import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ActionType = 'notification' | 'setting' | 'profile';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-buttons.html',
})
export class ActionButtons {
  @Output() actionClick = new EventEmitter<ActionType>();

  buttons = [
    { type: 'notification' as ActionType, label: 'Notifications', icon: '🔔' },
    { type: 'setting' as ActionType, label: 'Settings', icon: '⚙️' },
    { type: 'profile' as ActionType, label: 'Profile', icon: '👤' },
  ];

  onAction(type: ActionType): void {
    this.actionClick.emit(type);
  }
}
