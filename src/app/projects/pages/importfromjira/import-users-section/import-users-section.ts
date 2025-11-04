import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ImportNavigationService } from '../services/import-navigation-service';
import { Modal } from '../../../../shared/modal/modal';
import { JiraApi } from '../services/jira-api';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-users-section',
  imports: [CustomButton, CommonModule, Modal],
  templateUrl: './import-users-section.html',
  styleUrl: './import-users-section.css',
})
export class ImportUsersSection implements OnInit {
  public constructor(
    private importNavigationService: ImportNavigationService,
    private jiraApi: JiraApi,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  uploadSuccess = false;
  parsedData: any[] = [];
  missingUsers: any[] = [];
  operationResults: any[] = [];
  openMissingUserModal = false;
  missingUsersAvailable = false;
  operationResultsAvailable = false;
  openCsvGuideModal = false;

  isUploading = false;

  closeMissingUserModal() {
    this.openMissingUserModal = false;
  }

  closeCsvGuideModal() {
    this.openCsvGuideModal = false;
  }

  openOptionalInfo() {
    this.openCsvGuideModal = true;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    const raw = sessionStorage.getItem('import_response');
    if (!raw) return;

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    const results = Array.isArray(data?.results) ? data.results : [];

    if (users.length > 0) {
      this.missingUsersAvailable = true;
      this.missingUsers = users;
      this.openMissingUserModal = true;
    }

    if (results.length > 0) {
      this.operationResultsAvailable = true;
      this.operationResults = results;
      this.openMissingUserModal = true;
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
    }
    this.uploadSuccess = true;
    this.cdr.detectChanges();
  }

  onSkip() {
    console.log('Skipping user import...');
    this.router.navigate(['/projects']);
  }

  onContinue() {
    console.log('Importing users...');
    let postdata: any[] = [];
    this.parsedData.forEach((user) => {
      postdata.push({
        email: user['email'],
        name: user['User name'],
        jiraId: user['User id'],
        status: user['User status'],
      });
    });
    console.log('Prepared user data for upload:', postdata);
    this.isUploading = true;
    this.jiraApi.uploadUsersCsv(postdata).subscribe(
      (response) => {
        console.log('Users uploaded successfully:', response);
        this.isUploading = false;
        this.toastr.success('Users Upload Successful');
        this.router.navigate(['/projects']);
      },
      (error) => {
        console.error('Error uploading users:', error);
        this.uploadSuccess = false;
        this.isUploading = false;
        this.toastr.error('Error uploading users. Please try again.');
      }
    );
    sessionStorage.removeItem('import_response');
  }
}
