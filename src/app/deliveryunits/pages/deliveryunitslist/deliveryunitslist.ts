import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from "../../../shared/table/table";
import { Sectiontitle } from "../../../shared/sectiontitle/sectiontitle";
import { CustomButton } from "../../../shared/custom-button/custom-button";
import { SearchBar } from "../../../shared/components/search-bar/search-bar";
import { CommonModule } from '@angular/common';
import { Modal } from "../../../shared/modal/modal";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deliveryunitslist',
  standalone: true,
  imports: [Table, Sectiontitle, CustomButton, SearchBar, CommonModule, Modal, FormsModule],
  templateUrl: './deliveryunitslist.html',
  styleUrl: './deliveryunitslist.css'
})
export class Deliveryunitslist {
  searchQuery: string = '';
  filteredDeliveryUnits: any[] = [];
  isModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  duToDelete: any = null;
  selectedDeliveryUnits: any[] = [];
  private _resetPagination: boolean = false;
  isEditMode: boolean = false;
  editingDUCode: string = '';
  
  // Notification properties
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'success';

  get resetPagination(): boolean {
    return this._resetPagination;
  }

  set resetPagination(value: boolean) {
    this._resetPagination = value;
    // Reset back to false after change detection
    if (value) {
      setTimeout(() => this._resetPagination = false, 0);
    }
  }

  // Form data model
  newDU = {
    name: '',
    code: '',
    description: '',
    headName: '',
    headEmail: ''
  };

  // Available colors for DU avatars
  private duColors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500'];

  columns = [
    { 
      header: 'Delivery Unit Info', 
      field: 'duInfo', 
      type: 'avatar' as const,
      width: '30%'
    },
    { 
      header: 'DU Code', 
      field: 'duCode',
      type: 'text' as const,
      align: 'left' as const
    },
    { 
      header: 'DU Head', 
      field: 'duHead', 
      type: 'user' as const
    },
    { 
      header: 'Active Projects', 
      field: 'activeProjects',
      type: 'text' as const,
      align: 'left' as const,
      icon: 'images/Project-icon.svg',
      iconPosition: 'left' as const
    },
    { 
      header: 'Actions', 
      field: 'actions', 
      type: 'actions' as const,
      actions: [
        { label: 'Edit DU', icon: 'images/edit.svg', action: 'edit' },
        { label: 'Delete DU', icon: 'images/delete.svg', action: 'delete', class: 'danger' }
      ]
    }
  ];

  onSelectionChange(selectedRows: any[]) {
    this.selectedDeliveryUnits = selectedRows;
    console.log('Selected delivery units:', selectedRows);
  }

  deliveryUnits = [
    { duInfo: { initials: 'EN', name: 'Engineering', subtitle: 'Software Development & Architecture', bgColor: 'bg-blue-500' }, duCode: 'ENG-001', duHead: { avatar: 'SC', name: 'Sarah Chen', email: 'sarah.chen@company.com', bgColor: 'bg-gray-200' }, activeMembers: '24', activeProjects: '8' },
    { duInfo: { initials: 'PR', name: 'Product Management', subtitle: 'Product Strategy & Planning', bgColor: 'bg-purple-500' }, duCode: 'PM-002', duHead: { avatar: 'MR', name: 'Michael Rodriguez', email: 'michael.rodriguez@company.com', bgColor: 'bg-gray-200' }, activeMembers: '12', activeProjects: '5' },
    { duInfo: { initials: 'DE', name: 'Design', subtitle: 'UX/UI Design & Research', bgColor: 'bg-blue-500' }, duCode: 'DES-003', duHead: { avatar: 'ET', name: 'Emma Thompson', email: 'emma.thompson@company.com', bgColor: 'bg-gray-200' }, activeMembers: '8', activeProjects: '6' },
    { duInfo: { initials: 'MA', name: 'Marketing', subtitle: 'Digital Marketing & Growth', bgColor: 'bg-orange-500' }, duCode: 'MKT-004', duHead: { avatar: 'JW', name: 'James Wilson', email: 'james.wilson@company.com', bgColor: 'bg-gray-200' }, activeMembers: '15', activeProjects: '4' },
    { duInfo: { initials: 'SE', name: 'Security', subtitle: 'Information Security & Compliance', bgColor: 'bg-teal-500' }, duCode: 'SEC-005', duHead: { avatar: 'LA', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', bgColor: 'bg-gray-200' }, activeMembers: '6', activeProjects: '3' },
    { duInfo: { initials: 'QA', name: 'Quality Assurance', subtitle: 'Testing & QA Automation', bgColor: 'bg-green-500' }, duCode: 'QA-006', duHead: { avatar: 'KB', name: 'Kevin Brown', email: 'kevin.brown@company.com', bgColor: 'bg-gray-200' }, activeMembers: '10', activeProjects: '7' },
    { duInfo: { initials: 'HR', name: 'Human Resources', subtitle: 'Talent Acquisition & Management', bgColor: 'bg-pink-500' }, duCode: 'HR-007', duHead: { avatar: 'AL', name: 'Alice Lee', email: 'alice.lee@company.com', bgColor: 'bg-gray-200' }, activeMembers: '5', activeProjects: '2' },
    { duInfo: { initials: 'FN', name: 'Finance', subtitle: 'Budgeting & Financial Planning', bgColor: 'bg-yellow-500' }, duCode: 'FIN-008', duHead: { avatar: 'DP', name: 'Daniel Park', email: 'daniel.park@company.com', bgColor: 'bg-gray-200' }, activeMembers: '7', activeProjects: '3' },
    { duInfo: { initials: 'CS', name: 'Customer Success', subtitle: 'Client Support & Retention', bgColor: 'bg-indigo-500' }, duCode: 'CS-009', duHead: { avatar: 'ME', name: 'Maya Edwards', email: 'maya.edwards@company.com', bgColor: 'bg-gray-200' }, activeMembers: '9', activeProjects: '4' },
    { duInfo: { initials: 'RD', name: 'Research & Development', subtitle: 'Innovation & Product Research', bgColor: 'bg-red-500' }, duCode: 'RND-010', duHead: { avatar: 'TP', name: 'Thomas Parker', email: 'thomas.parker@company.com', bgColor: 'bg-gray-200' }, activeMembers: '11', activeProjects: '6' },
    { duInfo: { initials: 'IT', name: 'IT Support', subtitle: 'Infrastructure & Helpdesk', bgColor: 'bg-gray-500' }, duCode: 'IT-011', duHead: { avatar: 'RD', name: 'Rachel Davis', email: 'rachel.davis@company.com', bgColor: 'bg-gray-200' }, activeMembers: '8', activeProjects: '4' },
    { duInfo: { initials: 'BD', name: 'Business Development', subtitle: 'Sales & Partnerships', bgColor: 'bg-purple-400' }, duCode: 'BD-012', duHead: { avatar: 'JL', name: 'John Lee', email: 'john.lee@company.com', bgColor: 'bg-gray-200' }, activeMembers: '14', activeProjects: '5' },
    { duInfo: { initials: 'CSM', name: 'Compliance', subtitle: 'Legal & Regulatory', bgColor: 'bg-red-400' }, duCode: 'COM-013', duHead: { avatar: 'FN', name: 'Fiona Nguyen', email: 'fiona.nguyen@company.com', bgColor: 'bg-gray-200' }, activeMembers: '6', activeProjects: '2' },
    { duInfo: { initials: 'PMO', name: 'Project Management Office', subtitle: 'Project Planning & Governance', bgColor: 'bg-blue-400' }, duCode: 'PMO-014', duHead: { avatar: 'SC', name: 'Samuel Carter', email: 'samuel.carter@company.com', bgColor: 'bg-gray-200' }, activeMembers: '9', activeProjects: '5' },
    { duInfo: { initials: 'DS', name: 'Data Science', subtitle: 'Analytics & Machine Learning', bgColor: 'bg-teal-400' }, duCode: 'DS-015', duHead: { avatar: 'AM', name: 'Anna Martinez', email: 'anna.martinez@company.com', bgColor: 'bg-gray-200' }, activeMembers: '12', activeProjects: '6' },
    { duInfo: { initials: 'OPS', name: 'Operations', subtitle: 'Logistics & Operations', bgColor: 'bg-orange-400' }, duCode: 'OPS-016', duHead: { avatar: 'BB', name: 'Brian Brooks', email: 'brian.brooks@company.com', bgColor: 'bg-gray-200' }, activeMembers: '15', activeProjects: '7' },
    { duInfo: { initials: 'PRD', name: 'PR & Communications', subtitle: 'Public Relations & Media', bgColor: 'bg-pink-400' }, duCode: 'PR-017', duHead: { avatar: 'EC', name: 'Ella Clark', email: 'ella.clark@company.com', bgColor: 'bg-gray-200' }, activeMembers: '7', activeProjects: '3' },
    { duInfo: { initials: 'SCM', name: 'Supply Chain', subtitle: 'Procurement & Logistics', bgColor: 'bg-yellow-400' }, duCode: 'SC-018', duHead: { avatar: 'KM', name: 'Kevin Miller', email: 'kevin.miller@company.com', bgColor: 'bg-gray-200' }, activeMembers: '10', activeProjects: '6' },
    { duInfo: { initials: 'UX', name: 'User Experience', subtitle: 'UI/UX Research', bgColor: 'bg-indigo-400' }, duCode: 'UX-019', duHead: { avatar: 'LP', name: 'Laura Phillips', email: 'laura.phillips@company.com', bgColor: 'bg-gray-200' }, activeMembers: '8', activeProjects: '5' },
    { duInfo: { initials: 'DEVOPS', name: 'DevOps', subtitle: 'CI/CD & Automation', bgColor: 'bg-green-400' }, duCode: 'DO-020', duHead: { avatar: 'TM', name: 'Tom Morgan', email: 'tom.morgan@company.com', bgColor: 'bg-gray-200' }, activeMembers: '9', activeProjects: '4' },
    { duInfo: { initials: 'BI', name: 'Business Intelligence', subtitle: 'Reporting & Dashboards', bgColor: 'bg-blue-300' }, duCode: 'BI-021', duHead: { avatar: 'AK', name: 'Alicia King', email: 'alicia.king@company.com', bgColor: 'bg-gray-200' }, activeMembers: '11', activeProjects: '6' },
    { duInfo: { initials: 'CSG', name: 'Customer Support', subtitle: 'Helpdesk & Support', bgColor: 'bg-red-300' }, duCode: 'CSG-022', duHead: { avatar: 'JD', name: 'Jack Daniels', email: 'jack.daniels@company.com', bgColor: 'bg-gray-200' }, activeMembers: '13', activeProjects: '5' },
    { duInfo: { initials: 'INFRA', name: 'Infrastructure', subtitle: 'Network & Cloud', bgColor: 'bg-gray-400' }, duCode: 'INF-023', duHead: { avatar: 'EP', name: 'Ethan Price', email: 'ethan.price@company.com', bgColor: 'bg-gray-200' }, activeMembers: '7', activeProjects: '4' },
    { duInfo: { initials: 'AI', name: 'Artificial Intelligence', subtitle: 'AI & ML Projects', bgColor: 'bg-purple-300' }, duCode: 'AI-024', duHead: { avatar: 'MC', name: 'Megan Carter', email: 'megan.carter@company.com', bgColor: 'bg-gray-200' }, activeMembers: '10', activeProjects: '6' },
    { duInfo: { initials: 'LEGAL', name: 'Legal', subtitle: 'Contracts & Compliance', bgColor: 'bg-red-200' }, duCode: 'LG-025', duHead: { avatar: 'RB', name: 'Robert Brown', email: 'robert.brown@company.com', bgColor: 'bg-gray-200' }, activeMembers: '5', activeProjects: '2' },
    { duInfo: { initials: 'PMT', name: 'Project Team', subtitle: 'Project Execution & Delivery', bgColor: 'bg-orange-300' }, duCode: 'PMT-026', duHead: { avatar: 'SN', name: 'Sophie Nguyen', email: 'sophie.nguyen@company.com', bgColor: 'bg-gray-200' }, activeMembers: '14', activeProjects: '7' },
    { duInfo: { initials: 'BDM', name: 'Business Development & Marketing', subtitle: 'Growth & Strategy', bgColor: 'bg-yellow-300' }, duCode: 'BDM-027', duHead: { avatar: 'JP', name: 'James Patel', email: 'james.patel@company.com', bgColor: 'bg-gray-200' }, activeMembers: '12', activeProjects: '5' },
    { duInfo: { initials: 'OPS2', name: 'Operations 2', subtitle: 'Secondary Ops & Logistics', bgColor: 'bg-teal-300' }, duCode: 'OPS2-028', duHead: { avatar: 'CL', name: 'Chloe Liu', email: 'chloe.liu@company.com', bgColor: 'bg-gray-200' }, activeMembers: '9', activeProjects: '4' },
    { duInfo: { initials: 'IT2', name: 'IT Support 2', subtitle: 'Advanced IT & Cloud', bgColor: 'bg-blue-200' }, duCode: 'IT2-029', duHead: { avatar: 'MS', name: 'Mark Smith', email: 'mark.smith@company.com', bgColor: 'bg-gray-200' }, activeMembers: '8', activeProjects: '5' },
    { duInfo: { initials: 'RND2', name: 'R&D 2', subtitle: 'New Product Innovation', bgColor: 'bg-purple-200' }, duCode: 'RND2-030', duHead: { avatar: 'VR', name: 'Victoria Reed', email: 'victoria.reed@company.com', bgColor: 'bg-gray-200' }, activeMembers: '11', activeProjects: '6' }
  ];

  constructor(private router: Router) {
    this.updateFilteredDeliveryUnits();
  }

  // Show notification method
  displayNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  // Hide notification method
  hideNotification(): void {
    this.showNotification = false;
  }

  onAddNewDU(): void {
    this.isModalOpen = true;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingDUCode = '';
    this.resetForm();
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.duToDelete = null;
  }

  resetForm(): void {
    this.newDU = {
      name: '',
      code: '',
      description: '',
      headName: '',
      headEmail: ''
    };
  }

  onDUNameChange() {
    // Only auto-generate code when creating new DU, not when editing
    if (!this.isEditMode && this.newDU.name) {
      const prefix = this.newDU.name.trim().split(' ')[0].substring(0, 3).toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
      this.newDU.code = `${prefix}-${randomNum}`;
    }
  }

  getInitials(name: string): string {
    if (!name) return '';

    // Trim leading/trailing spaces and split by one or more spaces
    const parts = name.trim().split(/\s+/);

    // Handle single-word names
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    // Take first letters of first two words
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getRandomColor(): string {
    return this.duColors[Math.floor(Math.random() * this.duColors.length)];
  }

  validateForm(): boolean {
    if (!this.newDU.name.trim()) {
      this.displayNotification('Please enter a DU name', 'error');
      return false;
    }
    if (!this.newDU.code.trim()) {
      this.displayNotification('Please enter a DU code', 'error');
      return false;
    }
    // Validate DU code format
    const codePattern = /^[A-Z]{2,4}-\d{3}$/;
    if (!codePattern.test(this.newDU.code.toUpperCase())) {
      this.displayNotification('DU Code must be in format: 2-4 letters, dash, 3 digits (e.g., ENG-001)', 'error');
      return false;
    }
    // Check for duplicate code (skip check if editing the same DU)
    if (!this.isEditMode || this.newDU.code.toUpperCase() !== this.editingDUCode) {
      if (this.deliveryUnits.some(du => du.duCode === this.newDU.code.toUpperCase())) {
        this.displayNotification('This DU code already exists. Please use a unique code.', 'error');
        return false;
      }
    }
    if (!this.newDU.description.trim()) {
      this.displayNotification('Please enter a description', 'error');
      return false;
    }
    if (!this.newDU.headName.trim()) {
      this.displayNotification('Please enter the head name', 'error');
      return false;
    }
    if (!this.newDU.headEmail.trim()) {
      this.displayNotification('Please enter the head email', 'error');
      return false;
    }
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.newDU.headEmail)) {
      this.displayNotification('Please enter a valid email address', 'error');
      return false;
    }
    return true;
  }

  onSaveDeliveryUnit(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode) {
      // Update existing delivery unit
      const index = this.deliveryUnits.findIndex(du => du.duCode === this.editingDUCode);
      if (index !== -1) {
        this.deliveryUnits[index] = {
          duInfo: {
            initials: this.getInitials(this.newDU.name),
            name: this.newDU.name,
            subtitle: this.newDU.description,
            bgColor: this.deliveryUnits[index].duInfo.bgColor // Keep original color
          },
          duCode: this.newDU.code.toUpperCase(),
          duHead: {
            avatar: this.getInitials(this.newDU.headName),
            name: this.newDU.headName,
            email: this.newDU.headEmail,
            bgColor: 'bg-gray-200'
          },
          activeMembers: this.deliveryUnits[index].activeMembers,
          activeProjects: this.deliveryUnits[index].activeProjects
        };
        
        this.updateFilteredDeliveryUnits();
        console.log('Delivery Unit updated successfully');
        this.displayNotification('Delivery Unit updated successfully', 'success');
      }
    } else {
      // Create new delivery unit
      const newDeliveryUnit = {
        duInfo: {
          initials: this.getInitials(this.newDU.name),
          name: this.newDU.name,
          subtitle: this.newDU.description,
          bgColor: this.getRandomColor()
        },
        duCode: this.newDU.code.toUpperCase(),
        duHead: {
          avatar: this.getInitials(this.newDU.headName),
          name: this.newDU.headName,
          email: this.newDU.headEmail,
          bgColor: 'bg-gray-200'
        },
        activeMembers: '0',
        activeProjects: '0'
      };

      // Add to the beginning of the array for visibility
      this.deliveryUnits.unshift(newDeliveryUnit);
      this.filteredDeliveryUnits = [...this.deliveryUnits];

      console.log('Delivery Unit created successfully:', newDeliveryUnit);
      this.displayNotification('Delivery Unit created successfully', 'success');
    }
    
    // Close modal and reset form
    this.onCloseModal();
  }

  onCreateDeliveryUnit(event: Event): void {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode) {
      // Update existing delivery unit
      const index = this.deliveryUnits.findIndex(du => du.duCode === this.editingDUCode);
      if (index !== -1) {
        this.deliveryUnits[index] = {
          duInfo: {
            initials: this.getInitials(this.newDU.name),
            name: this.newDU.name,
            subtitle: this.newDU.description,
            bgColor: this.deliveryUnits[index].duInfo.bgColor // Keep original color
          },
          duCode: this.newDU.code.toUpperCase(),
          duHead: {
            avatar: this.getInitials(this.newDU.headName),
            name: this.newDU.headName,
            email: this.newDU.headEmail,
            bgColor: 'bg-gray-200'
          },
          activeMembers: this.deliveryUnits[index].activeMembers,
          activeProjects: this.deliveryUnits[index].activeProjects
        };
        
        this.updateFilteredDeliveryUnits();
        console.log('Delivery Unit updated successfully');
        this.displayNotification('Delivery Unit updated successfully', 'success');
      }
    } else {
      // Create new delivery unit
      const newDeliveryUnit = {
        duInfo: {
          initials: this.getInitials(this.newDU.name),
          name: this.newDU.name,
          subtitle: this.newDU.description,
          bgColor: this.getRandomColor()
        },
        duCode: this.newDU.code.toUpperCase(),
        duHead: {
          avatar: this.getInitials(this.newDU.headName),
          name: this.newDU.headName,
          email: this.newDU.headEmail,
          bgColor: 'bg-gray-200'
        },
        activeMembers: '0',
        activeProjects: '0'
      };

      // Add to the beginning of the array for visibility
      this.deliveryUnits.unshift(newDeliveryUnit);
      this.filteredDeliveryUnits = [...this.deliveryUnits];

      console.log('Delivery Unit created successfully:', newDeliveryUnit);
      this.displayNotification('Delivery Unit created successfully', 'success');
    }
    
    // Close modal and reset form
    this.onCloseModal();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query.toLowerCase();
    // Reset pagination to first page when search changes
    this.resetPagination = true;
    this.updateFilteredDeliveryUnits();
    // Update selections to only include delivery units that are still visible after filtering
    this.updateSelectionsForFilteredUnits();
  }

  updateFilteredDeliveryUnits(): void {
    if (!this.searchQuery) {
      this.filteredDeliveryUnits = [...this.deliveryUnits].map(du => ({
        ...du,
        selected: this.selectedDeliveryUnits.some(selected => selected.duCode === du.duCode)
      }));
      return;
    }

    this.filteredDeliveryUnits = this.deliveryUnits.filter(du => {
      return (
        du.duInfo.name.toLowerCase().includes(this.searchQuery) ||
        du.duInfo.subtitle.toLowerCase().includes(this.searchQuery) ||
        du.duCode.toLowerCase().includes(this.searchQuery) ||
        du.duHead.name.toLowerCase().includes(this.searchQuery) ||
        du.duHead.email.toLowerCase().includes(this.searchQuery)
      );
    }).map(du => ({
      ...du,
      selected: this.selectedDeliveryUnits.some(selected => selected.duCode === du.duCode)
    }));
  }

  updateSelectionsForFilteredUnits(): void {
    // Filter selected delivery units to only include those that are still visible after filtering
    const filteredUnitCodes = new Set(this.filteredDeliveryUnits.map(du => du.duCode));
    this.selectedDeliveryUnits = this.selectedDeliveryUnits.filter(selectedUnit => {
      return filteredUnitCodes.has(selectedUnit.duCode);
    });
  }

  onActionClick(event: {action: string, row: any}): void {
    switch(event.action) {
      case 'edit':
        this.editDeliveryUnit(event.row);
        break;
      case 'view':
        this.viewDeliveryUnit(event.row);
        break;
      case 'delete':
        this.deleteDeliveryUnit(event.row);
        break;
    }
  }

  editDeliveryUnit(du: any): void {
    console.log('Edit DU:', du);
    
    // Set edit mode
    this.isEditMode = true;
    this.editingDUCode = du.duCode;
    
    // Pre-fill the form with existing data
    this.newDU = {
      name: du.duInfo.name,
      code: du.duCode,
      description: du.duInfo.subtitle,
      headName: du.duHead.name,
      headEmail: du.duHead.email
    };
    
    // Open the modal
    this.isModalOpen = true;
  }

  viewDeliveryUnit(du: any): void {
    console.log('View DU:', du);
    this.router.navigate(['/delivery-units/view', du.duCode]);
  }

  deleteDeliveryUnit(du: any): void {
    // Handle null or malformed DU
    if (!du || !du.duInfo || !du.duInfo.name) return;

    // Store the DU to delete and open the confirmation modal
    this.duToDelete = du;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.duToDelete) return;

    const duName = this.duToDelete.duInfo.name;
    
    this.deliveryUnits = this.deliveryUnits.filter(u => u.duCode !== this.duToDelete.duCode);
    this.filteredDeliveryUnits = this.filteredDeliveryUnits.filter(u => u.duCode !== this.duToDelete.duCode);
    
    this.onCloseDeleteModal();
    this.displayNotification(`${duName} deleted successfully`, 'success');
  }
}