import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-userslist',
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, SearchBar],
  templateUrl: './userslist.html',
  styleUrl: './userslist.css'
})
export class Userslist {
  showTypeDropdown = false;
  showStatusDropdown = false;
  showAdvancedFilter = false;
  filterType: string = '';
  filterStatus: string = '';

  typeOptions = [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
    { label: 'Customer', value: 'customer' }
  ];
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' }
  ];

  onAddUser() {
    // Logic to add a new user
    console.log('Add User button clicked');
  }
  onImport() {
    // Logic to import user data
    console.log('Import button clicked');
  }
  onExport() {
    // Logic to export user data
    console.log('Export button clicked');
  }

  onAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onTypeChange(event: any) {
    this.filterType = event.target.value;
  }
  onStatusChange(event: any) {
    this.filterStatus = event.target.value;
  }
  selectType(value: string) {
    this.filterType = value;
    this.showTypeDropdown = false;
  }
  selectStatus(value: string) {
    this.filterStatus = value;
    this.showStatusDropdown = false;
  }
  getTypeLabel(): string {
    if (!this.filterType) return 'All Types';
    const found = this.typeOptions.find(opt => opt.value === this.filterType);
    return found ? found.label : 'All Types';
  }
  getStatusLabel(): string {
    if (!this.filterStatus) return 'All Status';
    const found = this.statusOptions.find(opt => opt.value === this.filterStatus);
    return found ? found.label : 'All Status';
  }
}
