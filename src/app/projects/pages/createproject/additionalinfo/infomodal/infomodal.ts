import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomButton } from '../../../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-infomodal',
  imports: [FormsModule, CustomButton],
  templateUrl: './infomodal.html',
  styleUrl: './infomodal.css'
})
export class Infomodal {
  fieldName: string = '';
  fieldValue: string = '';

  @Output() add = new EventEmitter<{name: string, value: string}>();
  @Output() cancel = new EventEmitter<void>();

  onAdd() {
    // Emit the new additional info and reset fields
    this.add.emit({ name: this.fieldName, value: this.fieldValue });
    this.fieldName = '';
    this.fieldValue = '';
  }

  onCancel() {
    // clear fields or close modal via parent; here we simply reset
    this.fieldName = '';
    this.fieldValue = '';
    this.cancel.emit();
  }
}
