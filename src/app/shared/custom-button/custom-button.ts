import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.html',
  imports: [NgIf, NgClass],
})
export class CustomButton {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() shortLabel?: string;
  @Input() bgClass: string = '';
  @Input() extraClasses: string = '';

  @Output() action = new EventEmitter<void>();

  onClick() {
    this.action.emit();
  }
}
