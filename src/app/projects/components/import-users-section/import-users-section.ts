import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Importnavigationservice } from '../../pages/importfromjira/importnavigationservice';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-import-users-section',
  imports: [CustomButton, CommonModule],
  templateUrl: './import-users-section.html',
  styleUrl: './import-users-section.css',
})
export class ImportUsersSection {
  public constructor(private importNavigationService: Importnavigationservice) {}

  uploadSuccess: boolean = false;
  parsedData: any[] = [];

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.parsedData = result.data;
          console.log('Parsed CSV:', this.parsedData);
          this.uploadSuccess = true;
          alert(this.uploadSuccess);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
        },
      });
      this.uploadSuccess = true;
    }
  }

  onContinue() {
    console.log('Importing users...');
    this.importNavigationService.onNext();
  }
}
