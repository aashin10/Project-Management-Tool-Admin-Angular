// custom-button.component.ts
import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  templateUrl: './custom-button.html',
  imports: [NgIf, NgClass],
})
export class CustomButton {
  // Content inputs
  @Input() icon?: string; // Optional icon path
  @Input() label!: string; // Main label (required)
  @Input() shortLabel?: string; // Label for mobile view
  
  // Styling inputs
  @Input() bgClass: string = 'bg-white'; // Background color class
  @Input() extraClasses: string = ''; // Additional custom classes
  @Input() height: string = 'h-9'; // Button height (h-9, h-10, h-11, etc.)
  @Input() textColor: string = 'text-black'; // Text color
  @Input() borderClass: string = 'border border-gray-300'; // Border styling
  @Input() hoverClass: string = 'hover:bg-gray-50'; // Hover effect
  @Input() padding: string = 'px-3 lg:px-4'; // Horizontal padding
  @Input() fontSize: string = 'text-sm'; // Font size
  @Input() fontWeight: string = 'font-medium'; // Font weight
  @Input() rounded: string = 'rounded-[2px]'; // Border radius
  @Input() gap: string = 'gap-2'; // Gap between icon and text
  
  // State inputs
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  
  // Output event
  @Output() action = new EventEmitter<void>();

  onClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.action.emit();
    }
  }

  get buttonClasses(): string {
    const baseClasses = [
      'flex items-center justify-center',
      'transition-colors',
      this.height,
      this.textColor,
      this.gap,
      this.padding,
      this.fontSize,
      this.fontWeight,
      this.rounded,
      this.bgClass,
      this.borderClass,
      this.hoverClass,
      this.extraClasses
    ];

    if (this.disabled || this.loading) {
      baseClasses.push('opacity-50 cursor-not-allowed');
    } else {
      baseClasses.push('cursor-pointer');
    }

    return baseClasses.filter(c => c).join(' ');
  }
}