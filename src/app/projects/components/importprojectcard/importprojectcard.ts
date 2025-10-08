import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  onSelect() {
    this.selected = !this.selected;
  }
}
