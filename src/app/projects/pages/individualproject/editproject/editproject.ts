import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../../shared/sectiontitle/sectiontitle';
import { BasicInformationComponent } from '../../../pages/createproject/basicinfo/basicinfo';
import { TeamOrganizationComponent } from '../../../pages/createproject/teaminfo/teaminfo';
import { Additionalinfo } from '../../../pages/createproject/additionalinfo/additionalinfo';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get project ID from route
    this.projectId = this.route.snapshot.params['id'];
    this.loadProjectData();
  }

  loadProjectData() {
    // Simulate loading project data - replace with actual API call
    // For now, using mock data
    this.projectName = 'Atlasss App';
    this.projectKey = 'ATL';
    this.description = 'Mobile application for atlas navigation and mapping';
    this.organisationName = 'Tech Solutions Inc';
    this.pocEmail = 'john.doe@techsolutions.com';
    this.phoneNumber = '+1-555-0123';
    this.manager = 'John Smith';
    this.deliveryUnit = 'Mobile Development';
    this.additionalFields = [
      { name: 'Budget', value: '$50,000' },
      { name: 'Timeline', value: '6 months' }
    ];
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
    // Implement project update logic
    console.log('Updating project:', {
      id: this.projectId,
      projectName: this.projectName,
      projectKey: this.projectKey,
      description: this.description,
      organisationName: this.organisationName,
      pocEmail: this.pocEmail,
      phoneNumber: this.phoneNumber,
      manager: this.manager,
      deliveryUnit: this.deliveryUnit,
      additionalFields: this.additionalFields
    });
    
    // Navigate back to project details or show success message
    this.router.navigate(['/projects', this.projectId]);
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
