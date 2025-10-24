import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from '../../../pages/createproject/basicinfo/basicinfo';
import { TeamOrganizationComponent } from '../../../pages/createproject/teaminfo/teaminfo';
import { Additionalinfo } from '../../../pages/createproject/additionalinfo/additionalinfo';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ProjectsService, Project } from '../../../../shared/services/projects.service';

@Component({
  selector: 'app-editproject',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    Sectiontitle,
    BasicInformationComponent,
    TeamOrganizationComponent,
    Additionalinfo,
    CustomButton
  ],
  templateUrl: './editproject.html',
  styleUrl: './editproject.css'
})
export class Editproject implements OnInit {
  get managerInitials(): string {
    if (!this.manager) return '';
    const names = this.manager.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  projectId: string = '';
  
  // Form properties
  projectName: string = '';
  projectKey: string = '';
  description: string = '';
  
  // Customer info
  organisationName: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  
  // Team info
  manager: string = '';
  deliveryUnit: string = '';
  
  // Additional fields
  additionalFields: Array<{name: string, value: string}> = [];

  showSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    // Get project ID from route
    this.projectId = this.route.snapshot.params['id'];
    this.loadProjectData();
  }

  loadProjectData() {
    const project = this.projectsService.getProjectById(this.projectId);
    if (project) {
      this.projectName = project.name;
      this.projectKey = project.projectCode;
      this.description = project.additionalInformation?.find(info => info.name === 'Description')?.value || '';
      this.organisationName = project.organisationName || '';
      this.pocEmail = project.pocEmail || '';
      this.phoneNumber = project.pocPhone || '';
      this.manager = project.projectManager;
      this.deliveryUnit = project.deliveryUnit;
      this.additionalFields = project.additionalInformation || [];
    }
  }

  // Event handlers for form changes
  onProjectNameChange(name: string) {
    this.projectName = name;
  }

  onProjectKeyChange(key: string) {
    this.projectKey = key;
  }

  onDescriptionChange(desc: string) {
    this.description = desc;
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

  onAdditionalFieldsChange(fields: Array<{name: string, value: string}>) {
    this.additionalFields = fields;
  }

  onUpdateProject() {
    // Get the current project to preserve fields not being edited
    const currentProject = this.projectsService.getProjectById(this.projectId);
    
    if (!currentProject) {
      console.error('Project not found');
      return;
    }

    // Update the project using the service
    const success = this.projectsService.updateProject(this.projectId, {
      name: this.projectName,
      projectCode: this.projectKey,
      description: this.description,
      organisationName: this.organisationName,
      pocEmail: this.pocEmail,
      pocPhone: this.phoneNumber,
      projectManager: this.manager,
      deliveryUnit: this.deliveryUnit,
      additionalInformation: this.additionalFields
    });

    if (success) {
      console.log('Project updated successfully');
      // Show success message
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        this.router.navigate(['/projects']);
      }, 1800);
    } else {
      console.error('Failed to update project');
    }
  }

  onEditTeamMembers() {
    // Navigate to team members edit page
    this.router.navigate(['/projects', this.projectId, 'team']);
  }

  onCancel() {
    // Navigate back to project details
    this.router.navigate(['/projects', this.projectId]);
  }

  get canCreate(): boolean {
    const basic = !!(this.projectName && this.projectName.trim() && this.projectKey && this.projectKey.trim());
    const team = !!(this.manager && this.manager.trim() && this.deliveryUnit && this.deliveryUnit.trim());
    const customer = !!(this.organisationName && this.organisationName.trim() && this.pocEmail && this.pocEmail.trim() && this.phoneNumber && this.phoneNumber.trim());
    return basic && team && customer;
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.projectName || !this.projectName.trim()) missing.push('Project Name');
    if (!this.projectKey || !this.projectKey.trim()) missing.push('Project Key');
    if (!this.manager || !this.manager.trim()) missing.push('Project Manager');
    if (!this.deliveryUnit || !this.deliveryUnit.trim()) missing.push('Delivery Unit');
    if (!this.organisationName || !this.organisationName.trim()) missing.push('Organisation Name');
    if (!this.pocEmail || !this.pocEmail.trim()) missing.push('POC Email');
    if (!this.phoneNumber || !this.phoneNumber.trim()) missing.push('Phone Number');
    return missing;
  }

  getInitials(): string {
    if (!this.projectName) {
      return 'PN';
    }
    const words = this.projectName.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) {
      return 'PN';
    }
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    // Safe access to avoid undefined character access
    const firstChar = words[0] && words[0][0] ? words[0][0] : 'P';
    const secondChar = words[1] && words[1][0] ? words[1][0] : 'N';
    return (firstChar + secondChar).toUpperCase();
  }
}
