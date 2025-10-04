// search-bar.component.ts
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SearchBar {
  @Input() placeholder: string = 'Search...';
  @Input() backgroundColor: string = 'bg-[#FBFBFB]';
  @Input() height: string = 'py-2';
  @Input() width: string = 'w-full';
  @Input() border: string = 'border';
  @Input() borderColor: string = 'border-[#DFE1E6]';

  @Output() search = new EventEmitter<string>();

  searchQuery: string = '';

  onInputChange() {
    this.search.emit(this.searchQuery);
  }

  get inputClasses(): string {
    return `${this.width} ${this.height} ${this.border} ${this.borderColor} ${this.backgroundColor} pl-8 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm placeholder-[#8993A4] text-black`;
  }

  onSearch(): void {
    this.search.emit(this.searchQuery);
  }
}
