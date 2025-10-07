import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Importnavigationservice } from '../../pages/importfromjira/importnavigationservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-users-section',
  imports: [CustomButton, CommonModule],
  templateUrl: './import-users-section.html',
  styleUrl: './import-users-section.css',
})
export class ImportUsersSection {
  public constructor(private importNavigationService: Importnavigationservice) {}

  uploadSuccess: boolean = false;

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadSuccess = true;
    }
  }

  onContinue() {
    console.log('Importing users...');
    this.importNavigationService.onNext();
  }
}
