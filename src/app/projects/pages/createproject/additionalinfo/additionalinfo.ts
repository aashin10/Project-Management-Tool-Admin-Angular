import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { Modal } from '../../../../shared/modal/modal';

@Component({
  selector: 'app-additionalinfo',
  imports: [CustomButton, CommonModule, FormsModule, Modal],
  templateUrl: './additionalinfo.html',
  styleUrl: './additionalinfo.css'
})
export class Additionalinfo {
  modalOpen: boolean = false;
  newFieldName: string = '';
  newFieldValue: string = '';
  addedFields: Array<{name: string, value: string}> = [];
  @Output() addedFieldsChange = new EventEmitter<Array<{name: string, value: string}>>();

  onAddInfo() {
    this.modalOpen = true;
  }

  handleAdd(info: {name: string, value: string}) {
    console.log('Received additional info', info);
    this.addedFields.push(info);
    this.modalOpen = false;
    this.emitAddedFields();
    // TODO: persist or pass info to parent
  }

  addFromModal() {
    // Require both name and value to be present
    if (!this.newFieldName || !this.newFieldValue) return;
    const info = { name: this.toTitleCase(this.newFieldName), value: this.toTitleCase(this.newFieldValue) };
    this.addedFields.push(info);
    this.newFieldName = '';
    this.newFieldValue = '';
    this.modalOpen = false;
    this.emitAddedFields();
  }

  updateFieldValue(value: string, idx: number) {
    this.addedFields[idx].value = this.toTitleCase(value || '');
    this.emitAddedFields();
  }

  toTitleCase(str: string) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  handleCancel() {
    this.modalOpen = false;
  }

  removeField(idx: number) {
    this.addedFields.splice(idx, 1);
    this.emitAddedFields();
  }

  emitAddedFields() {
    this.addedFieldsChange.emit(this.addedFields);
  }
}
