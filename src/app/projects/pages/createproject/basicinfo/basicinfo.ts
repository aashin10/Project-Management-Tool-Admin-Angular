import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ProjectStatusService } from '../../../../shared/services/project-status/project-status.service';

@Component({
  selector: 'app-basic-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basicinfo.html',
  styleUrl: './basicinfo.css'
})
export class BasicInformationComponent implements OnChanges {
  // Private properties for two-way binding
  private _projectName: string = '';
  private _projectKey: string = '';
  private _description: string = '';
  private _organisationName: string = '';
  private _customerDescription: string = '';
  private _domainLink: string = '';
  private _pocEmail: string = '';
  private _phoneNumber: string = '';
  private _status: string = 'Active';

  // Validation errors
  emailError: string = '';
  phoneError: string = '';

  // Regex patterns for validation
  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phonePattern = /^\+?[\d\s\-()]{7,}$/;

  // Two-way binding getters and setters
  @Input() 
  get projectName(): string {
    return this._projectName;
  }
  set projectName(value: string) {
    this._projectName = value || '';
    this.projectNameChange.emit(this._projectName);
  }

  @Input()
  get projectKey(): string {
    return this._projectKey;
  }
  set projectKey(value: string) {
    this._projectKey = value || '';
    this.projectKeyChange.emit(this._projectKey);
  }

  @Input()
  get description(): string {
    return this._description;
  }
  set description(value: string) {
    this._description = value || '';
    this.descriptionChange.emit(this._description);
  }

  @Input()
  get organisationName(): string {
    return this._organisationName;
  }
  set organisationName(value: string) {
    this._organisationName = value || '';
    this.organisationNameChange.emit(this._organisationName);
  }

  @Input()
  get customerDescription(): string {
    return this._customerDescription;
  }
  set customerDescription(value: string) {
    this._customerDescription = value || '';
    this.customerDescriptionChange.emit(this._customerDescription);
  }

  @Input()
  get domainLink(): string {
    return this._domainLink;
  }
  set domainLink(value: string) {
    this._domainLink = value || '';
    this.domainLinkChange.emit(this._domainLink);
  }

  @Input()
  get pocEmail(): string {
    return this._pocEmail;
  }
  set pocEmail(value: string) {
    this._pocEmail = value || '';
    this.pocEmailChange.emit(this._pocEmail);
  }

  @Input()
  get phoneNumber(): string {
    return this._phoneNumber;
  }
  set phoneNumber(value: string) {
    this._phoneNumber = value || '';
    this.phoneNumberChange.emit(this._phoneNumber);
  }

  @Input()
  get status(): string {
    return this._status;
  }
  set status(value: string) {
    this._status = value || 'Active';
    this.statusChange.emit(this._status);
  }

  @Input() isEditMode: boolean = false; // New input to distinguish between create and edit modes

  @Output() statusChange = new EventEmitter<string>();
  @Output() projectNameChange = new EventEmitter<string>();
  @Output() projectKeyChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() organisationNameChange = new EventEmitter<string>();
  @Output() customerDescriptionChange = new EventEmitter<string>();
  @Output() domainLinkChange = new EventEmitter<string>();
  @Output() pocEmailChange = new EventEmitter<string>();
  @Output() phoneNumberChange = new EventEmitter<string>();

  constructor(private projectStatusService: ProjectStatusService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('BasicInformationComponent - ngOnChanges triggered:', changes);
    
    // Update private properties directly without triggering change events during initialization
    if (changes['projectName'] && changes['projectName'].currentValue !== undefined) {
      this._projectName = changes['projectName'].currentValue || '';
    }
    if (changes['projectKey'] && changes['projectKey'].currentValue !== undefined) {
      this._projectKey = changes['projectKey'].currentValue || '';
    }
    if (changes['description'] && changes['description'].currentValue !== undefined) {
      this._description = changes['description'].currentValue || '';
    }
    if (changes['organisationName'] && changes['organisationName'].currentValue !== undefined) {
      this._organisationName = changes['organisationName'].currentValue || '';
    }
    if (changes['customerDescription'] && changes['customerDescription'].currentValue !== undefined) {
      this._customerDescription = changes['customerDescription'].currentValue || '';
    }
    if (changes['domainLink'] && changes['domainLink'].currentValue !== undefined) {
      this._domainLink = changes['domainLink'].currentValue || '';
    }
    if (changes['pocEmail'] && changes['pocEmail'].currentValue !== undefined) {
      this._pocEmail = changes['pocEmail'].currentValue || '';
    }
    if (changes['phoneNumber'] && changes['phoneNumber'].currentValue !== undefined) {
      this._phoneNumber = changes['phoneNumber'].currentValue || '';
    }
    if (changes['status'] && changes['status'].currentValue !== undefined) {
      this._status = changes['status'].currentValue || 'Active';
      console.log('Status updated to:', this._status);
    }
    
    // Force change detection to update template
    this.cdr.detectChanges();
  }

  get statusOptions(): Observable<{value: string, label: string, color: string}[]> {
    return this.projectStatusService.getStatuses().pipe(
      map(statuses => statuses.map(status => ({
        value: status.code,
        label: status.name,
        color: this.getStatusColor(status.code)
      })))
    );
  }

  // Get color for status circle indicator
  getStatusColor(statusCode: string): string {
    if (statusCode === 'Active') {
      return 'bg-green-500';
    } else if (statusCode === 'Inactive') {
      return 'bg-gray-500';
    } else if (statusCode === 'Completed') {
      return 'bg-blue-500';
    }
    return 'bg-gray-500';
  }

  templateOptions = [
    { value: 'Scrum', label: 'Scrum', color: '#10B981' },
    { value: 'Kanban', label: 'Kanban', color: '#3B82F6' }
  ];
  
  statusDropdownOpen = false;

  onProjectNameChange() {
    this.projectNameChange.emit(this._projectName);
    this.generateProjectKey();
  }

  onProjectKeyChange() {
    // Ensure project key is always uppercase
    if (this._projectKey) {
      this._projectKey = this._projectKey.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    }
    this.projectKeyChange.emit(this._projectKey);
  }

  onStatusChange() {
    this.statusChange.emit(this._status);
  }

  onOrganisationNameChange() {
    this.organisationNameChange.emit(this._organisationName);
  }

  onCustomerDescriptionChange() {
    this.customerDescriptionChange.emit(this._customerDescription);
  }

  onDomainLinkChange() {
    this.domainLinkChange.emit(this._domainLink);
  }

  onPocEmailChange() {
    this.validateEmail();
    this.pocEmailChange.emit(this._pocEmail);
  }

  onPhoneNumberChange() {
    this.validatePhone();
    this.phoneNumberChange.emit(this._phoneNumber);
  }

  validateEmail(): boolean {
    if (!this._pocEmail || this._pocEmail.trim() === '') {
      this.emailError = '';
      return true;
    }
    
    if (!this.emailPattern.test(this._pocEmail)) {
      this.emailError = 'Please enter a valid email address (e.g., user@example.com)';
      return false;
    }
    
    this.emailError = '';
    return true;
  }

  validatePhone(): boolean {
    if (!this._phoneNumber || this._phoneNumber.trim() === '') {
      this.phoneError = '';
      return true;
    }
    
    if (!this.phonePattern.test(this._phoneNumber)) {
      this.phoneError = 'Please enter a valid phone number (at least 7 digits)';
      return false;
    }
    
    this.phoneError = '';
    return true;
  }

  generateProjectKey() {
    // User-specified rules:
    // - If project name has 2 or more words: key = first letter of word1 + first letter of word2 + last letter of word2
    // - If project name has 1 word: key = first letter + middle letter + last letter of that word
    // - If empty or unable to form letters, fallback to 'PRJ'
    const fallback = 'PRJ';
    if (this._projectName && this._projectName.trim()) {
      const words = this._projectName.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 3) {
        // Use first letters of the first three words
        const chs = [words[0][0], words[1][0], words[2][0]].map(c => (c ? c.toUpperCase() : ''));
        const candidate = chs.join('').replace(/[^A-Z0-9]/g, '');
        this._projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 2) {
        // Two-word rule: first letter of word1, first letter of word2, last letter of word2
        const w1 = words[0];
        const w2 = words[1];
        const ch1 = w1[0] ? w1[0].toUpperCase() : '';
        const ch2 = w2[0] ? w2[0].toUpperCase() : '';
        const ch3 = w2[w2.length - 1] ? w2[w2.length - 1].toUpperCase() : '';
        const candidate = (ch1 + ch2 + ch3).replace(/[^A-Z0-9]/g, '');
        this._projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 1) {
        const w = words[0];
        const first = w[0] ? w[0].toUpperCase() : '';
        // middle char: for even length choose left-middle (Math.floor((len-1)/2))
        const midIndex = Math.floor((w.length - 1) / 2);
        const middle = w[midIndex] ? w[midIndex].toUpperCase() : '';
        const last = w[w.length - 1] ? w[w.length - 1].toUpperCase() : '';
        const candidate = (first + middle + last).replace(/[^A-Z0-9]/g, '');
        this._projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else {
        this._projectKey = fallback;
      }
    } else {
      this._projectKey = fallback;
    }
    this.projectKeyChange.emit(this._projectKey);
  }
}