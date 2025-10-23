import { Component, OnInit } from '@angular/core';
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
    // Handle create project logic
    console.log('Creating project:', {
      name: this.projectName,
      key: this.projectKey,
      description: this.description,
      manager: this.manager,
      deliveryUnit: this.deliveryUnit
      , additionalFields: this.additionalFields
    });
  }

  onCancel() {
    // Handle cancel logic
    console.log('Cancel project creation');
  }
}
