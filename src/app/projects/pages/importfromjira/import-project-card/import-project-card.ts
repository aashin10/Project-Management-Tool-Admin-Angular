import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-import-project-card',
  imports: [CommonModule],
  templateUrl: './import-project-card.html',
  styleUrl: './import-project-card.css',
})
export class ImportProjectCard {
  @Input() title: string = '';
  @Input() key: string = '';
  @Input() selected: boolean = false;
  @Input() id: string = '';
  @Output() selectChange = new EventEmitter<{ selected: boolean; id: string }>();

  onSelect() {
    this.selected = !this.selected;
    this.selectChange.emit({ selected: this.selected, id: this.id });
  }
}
