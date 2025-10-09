import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-importprojectcard',
  imports: [CommonModule],
  templateUrl: './importprojectcard.html',
  styleUrl: './importprojectcard.css',
})
export class Importprojectcard {
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
