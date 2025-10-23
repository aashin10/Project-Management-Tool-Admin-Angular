import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProjectsService } from '../../../shared/services/projects.service';
import { DeliveryUnitsService } from '../../../shared/services/delivery-units.service';
import { ProjectStatusService } from '../../../shared/services/project-status.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
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
  organisationDescription: string = '';
  organisationWebsite: string = '';
  pocEmail: string = '';
  phoneNumber: string = '';
  manager: string = '';
  status: string = 'Active'; // default to 'Active'
  deliveryUnit: string = '';
  additionalFields: Array<{name: string, value: string}> = [];
  // Project dates
  startDate: string = '';
  endDate: string = '';
  totalSprintCount: number = 0;
  // Keep template and sharing info if passed from list
  selectedTemplate: string = '';
  shareWithExisting: boolean = false;
  selectedProjectToShare: string = '';
  showSuccess: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private projectsService: ProjectsService,
    private deliveryUnitsService: DeliveryUnitsService,
    private projectStatusService: ProjectStatusService,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['template']) {
        this.selectedTemplate = params['template'];
      }
      if (params['name']) this.projectName = params['name'];
      if (params['projectKey']) this.projectKey = params['projectKey'];
      if (params['shareWithExisting'] !== undefined) this.shareWithExisting = params['shareWithExisting'] === 'true' || params['shareWithExisting'] === true;
      if (params['selectedProject']) {
        this.selectedProjectToShare = params['selectedProject'];
        // Auto-fill details from selected project
        const selectedProject = this.projectsService.getProjectById(params['selectedProject']);
        if (selectedProject) {
          this.selectedTemplate = selectedProject.template;
          this.deliveryUnit = selectedProject.deliveryUnit;
          this.status = selectedProject.status;
        }
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

  onTemplateChange(template: string) {
    this.selectedTemplate = template;
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

  get deliveryUnitOptions() {
    return this.deliveryUnitsService.getDeliveryUnits().map(du => ({
      value: du.code,
      label: du.name,
      description: du.description
    }));
  }

  get statusOptions() {
    return this.projectStatusService.getStatuses().map(status => ({
      value: status.code,
      label: status.name,
      description: status.description
    }));
  }

  onDeliveryUnitChange(unit: string) {
    this.deliveryUnit = unit;
  }

  onStatusChange(status: string) {
    this.status = status;
  }

  onCreateProject() {
    // Generate avatar from project name initials
    const generateAvatar = (name: string) => {
      return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
    };

    // Create new project object
    const newProject = {
      id: Date.now().toString(), // Simple ID generation for demo
      name: this.projectName,
      projectCode: this.projectKey,
      status: this.status as 'Active' | 'Inactive' | 'Completed',
      deliveryUnit: this.deliveryUnit,
      projectManager: this.manager,
      teamSize: 0, // Default team size
      template: this.selectedTemplate as 'Scrum' | 'Kanban',
      avatar: generateAvatar(this.projectName),
      organisationName: this.organisationName,
      organisationDescription: this.organisationDescription,
      organisationWebsite: this.organisationWebsite,
      pocEmail: this.pocEmail,
      pocPhone: this.phoneNumber,
      startDate: this.startDate,
      endDate: this.endDate,
      totalSprintCount: this.totalSprintCount || 0,
      additionalInformation: this.additionalFields.length > 0 ? [...this.additionalFields] : undefined
    };

    // Add project to service
    this.projectsService.addProject(newProject);

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

    // Show success message
    this.showSuccess = true;

    // Navigate after short delay
    setTimeout(() => {
      this.router.navigate(['/projects']);
    }, 600);
  }
  

  onCancel() {
    // Navigate back to projects list
    this.router.navigate(['/projects']);
  }
}
