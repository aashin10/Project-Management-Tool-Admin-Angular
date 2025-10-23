<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
=======
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { ToastrService } from 'ngx-toastr';
>>>>>>> 202566e3fabfb69912068b7f1c6adca0682fbf6e
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from './basicinfo/basicinfo';
import { TeamOrganizationComponent } from './teaminfo/teaminfo';
import { ProjectPreviewComponent } from './projectpreview/projectpreview';
import { Additionalinfo } from './additionalinfo/additionalinfo';
@Component({
  selector: 'app-createproject',
  standalone: true,
  imports: [
    CommonModule, 
    Sectiontitle,
    BasicInformationComponent,
    TeamOrganizationComponent,
    ProjectPreviewComponent,
    Additionalinfo
  ],
  templateUrl: './createproject.html',
  styleUrl: './createproject.css'
})
export class Createproject {
  // Form properties
  projectName: string = '';
  projectKey: string = '';
  description: string = '';
  // Customer info
  organisationName: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  manager: string = '';
  deliveryUnit: string = '';
  additionalFields: Array<{name: string, value: string}> = [];
  // Keep template and sharing info if passed from list
  selectedTemplate: string = '';
  shareWithExisting: boolean = false;
  selectedProjectToShare: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params['name']) this.projectName = params['name'];
      if (params['projectKey']) this.projectKey = params['projectKey'];
      if (params['template']) this.selectedTemplate = params['template'];
      if (params['shareWithExisting'] !== undefined) this.shareWithExisting = params['shareWithExisting'] === 'true' || params['shareWithExisting'] === true;
      if (params['selectedProject']) this.selectedProjectToShare = params['selectedProject'];
    });
  }

  showSuccess: boolean = false;
  selectedTemplate: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['template']) {
        this.selectedTemplate = params['template'];
      }
    });
  }

  onProjectNameChange(name: string) {
    this.projectName = name;
  }

  onProjectKeyChange(key: string) {
    this.projectKey = key;
  }

  onDescriptionChange(description: string) {
    this.description = description;
  }

  onOrganisationNameChange(name: string) {
    this.organisationName = name;
  }

  onPocEmailChange(email: string) {
    this.pocEmail = email;
  }

  onPhoneNumberChange(phone: string) {
    this.phoneNumber = phone;
  }

  onManagerChange(manager: string) {
    this.manager = manager;
  }

  onDeliveryUnitChange(unit: string) {
    this.deliveryUnit = unit;
  }

  onCreateProject() {
    // Handle create project logic (save to backend or local data)
    console.log('Creating project:', {
      name: this.projectName,
      key: this.projectKey,
      description: this.description,
      manager: this.manager,
      deliveryUnit: this.deliveryUnit,
      additionalFields: this.additionalFields
    });
    // Show notification using NotificationService
    this.notificationService.addNotification(
      'success',
      `${this.projectName} created successfully`,
      'Project Created'
    );
    // Show Toastr success message
    this.toastr.success(
      `${this.projectName} created successfully`,
      '',
      {
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      }
    );
    // Navigate after short delay
    setTimeout(() => {
      this.router.navigate(['/projects']);
    }, 600);
  }
  

  onCancel() {
    // Handle cancel logic
    console.log('Cancel project creation');
  }
}
