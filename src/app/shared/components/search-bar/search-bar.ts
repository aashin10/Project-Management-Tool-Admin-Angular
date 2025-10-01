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
  @Input() placeholder: string = '';
  @Output() search = new EventEmitter<string>();

  searchQuery: string = '';

  onSearch(): void {
    this.search.emit(this.searchQuery);
  }
}
