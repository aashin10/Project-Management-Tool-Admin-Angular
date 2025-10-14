import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basicinfo.html',
  styleUrl: './basicinfo.css'
})
export class BasicInformationComponent {
  @Input() projectName: string = '';
  @Input() projectKey: string = '';
  @Input() description: string = '';
  // Customer information inputs
  @Input() organisationName: string = '';
  @Input() customerDescription: string = '';
  @Input() domainLink: string = '';
  @Input() pocEmail: string = '';
  @Input() phoneNumber: string = '';
  @Input() status: string = 'active'; // default to 'active'
  @Output() statusChange = new EventEmitter<string>();

  @Output() projectNameChange = new EventEmitter<string>();
  @Output() projectKeyChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  // Customer information outputs
  @Output() organisationNameChange = new EventEmitter<string>();
  @Output() customerDescriptionChange = new EventEmitter<string>();
  @Output() domainLinkChange = new EventEmitter<string>();
  @Output() pocEmailChange = new EventEmitter<string>();
  @Output() phoneNumberChange = new EventEmitter<string>();

  statusOptions = [
    { value: 'active', label: 'Active', color: '#2196F3' },
    { value: 'inactive', label: 'Inactive', color: '#9E9E9E' },
    { value: 'completed', label: 'Completed', color: '#4CAF50' }
  ];

  statusDropdownOpen = false;

  get selectedStatus() {
    return this.statusOptions.find(opt => opt.value === this.status) || this.statusOptions[0];
  }

  toggleStatusDropdown() {
    this.statusDropdownOpen = !this.statusDropdownOpen;
  }

  selectStatus(value: string) {
    this.status = value;
    this.statusChange.emit(this.status);
    this.statusDropdownOpen = false;
  }

  onProjectNameChange() {
    this.projectNameChange.emit(this.projectName);
    this.generateProjectKey();
  }

  onOrganisationNameChange() {
    this.organisationNameChange.emit(this.organisationName);
  }

  onCustomerDescriptionChange() {
    this.customerDescriptionChange.emit(this.customerDescription);
  }

  onDomainLinkChange() {
    this.domainLinkChange.emit(this.domainLink);
  }

  onPocEmailChange() {
    this.pocEmailChange.emit(this.pocEmail);
  }

  onPhoneNumberChange() {
    this.phoneNumberChange.emit(this.phoneNumber);
  }

  generateProjectKey() {
    // User-specified rules:
    // - If project name has 2 or more words: key = first letter of word1 + first letter of word2 + last letter of word2
    // - If project name has 1 word: key = first letter + middle letter + last letter of that word
    // - If empty or unable to form letters, fallback to 'PRJ'
    const fallback = 'PRJ';
    if (this.projectName && this.projectName.trim()) {
      const words = this.projectName.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 3) {
        // Use first letters of the first three words
        const chs = [words[0][0], words[1][0], words[2][0]].map(c => (c ? c.toUpperCase() : ''));
        const candidate = chs.join('').replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 2) {
        // Two-word rule: first letter of word1, first letter of word2, last letter of word2
        const w1 = words[0];
        const w2 = words[1];
        const ch1 = w1[0] ? w1[0].toUpperCase() : '';
        const ch2 = w2[0] ? w2[0].toUpperCase() : '';
        const ch3 = w2[w2.length - 1] ? w2[w2.length - 1].toUpperCase() : '';
        const candidate = (ch1 + ch2 + ch3).replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else if (words.length === 1) {
        const w = words[0];
        const first = w[0] ? w[0].toUpperCase() : '';
        // middle char: for even length choose left-middle (Math.floor((len-1)/2))
        const midIndex = Math.floor((w.length - 1) / 2);
        const middle = w[midIndex] ? w[midIndex].toUpperCase() : '';
        const last = w[w.length - 1] ? w[w.length - 1].toUpperCase() : '';
        const candidate = (first + middle + last).replace(/[^A-Z0-9]/g, '');
        this.projectKey = candidate.length === 3 ? candidate : (candidate + 'X'.repeat(Math.max(0, 3 - candidate.length))).slice(0, 3);
      } else {
        this.projectKey = fallback;
      }
    } else {
      this.projectKey = fallback;
    }
    this.projectKeyChange.emit(this.projectKey);
  }
}