import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from './basicinfo/basicinfo';
import { TeamOrganizationComponent } from './teaminfo/teaminfo';
import { ProjectPreviewComponent } from './projectpreview/projectpreview';
import { CustomButton } from '../../../shared/custom-button/custom-button';
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
    CustomButton,
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
  priority: string = '';
  manager: string = '';
  deliveryUnit: string = '';
  additionalFields: Array<{name: string, value: string}> = [];

  onProjectNameChange(name: string) {
    this.projectName = name;
  }

  onProjectKeyChange(key: string) {
    this.projectKey = key;
  }

  onDescriptionChange(description: string) {
    this.description = description;
  }

  onPriorityChange(priority: string) {
    this.priority = priority;
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
      priority: this.priority,
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
