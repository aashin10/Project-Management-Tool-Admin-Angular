import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ImportNavigationService } from '../services/import-navigation-service';
import { Modal } from '../../../../shared/modal/modal';

@Component({
  selector: 'app-import-users-section',
  imports: [CustomButton, CommonModule, Modal],
  templateUrl: './import-users-section.html',
  styleUrl: './import-users-section.css',
})
export class ImportUsersSection implements OnInit {
  public constructor(private importNavigationService: ImportNavigationService) {}

  uploadSuccess: boolean = false;
  parsedData: any[] = [];
  missingUsers: any[] = [];
  openMissingUserModal = false;

  closeMissingUserModal() {
    this.openMissingUserModal = false;
  }

  ngOnInit() {
    console.log('ImportUsersSection initialized');
    const users = sessionStorage.getItem('users_missing');
    if (users) {
      console.log('Found missing users in sessionStorage:', users);
      const userArray = JSON.parse(users);
      if (userArray.length > 0) {
        this.openMissingUserModal = true;
        this.missingUsers = userArray;
        console.log('Missing users loaded:', this.missingUsers);
      }
    }
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      Papa.parse(file as File, {
        header: true,
        skipEmptyLines: true,
        complete: (result: ParseResult<any>) => {
          if (result.errors && result.errors.length > 0) {
            console.error('CSV parsing errors:', result.errors);
            return;
          }
          this.parsedData = result.data;
          console.log('Parsed CSV:', this.parsedData);
          this.uploadSuccess = true;
        },
      });
      this.uploadSuccess = true;
    }
  }

  onContinue() {
    console.log('Importing users...');
  }
}
