import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { Infomodal } from './infomodal/infomodal';

@Component({
  selector: 'app-additionalinfo',
  imports: [CustomButton, CommonModule, FormsModule, Infomodal],
  templateUrl: './additionalinfo.html',
  styleUrl: './additionalinfo.css'
})
export class Additionalinfo {
  modalOpen: boolean = false;
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
