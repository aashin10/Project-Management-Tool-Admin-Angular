import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Modal } from '../../../shared/modal/modal';

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  addedDate: string;
  initials: string;
  initialsColor: string;
}

@Component({
  selector: 'app-settingsmain',
  standalone: true,
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, Modal],
  templateUrl: './settingsmain.html',
  styleUrl: './settingsmain.css'
})
export class Settingsmain {
  superAdmins: SuperAdmin[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      addedDate: 'Jan 15, 2024',
      initials: 'JD',
      initialsColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      addedDate: 'Feb 20, 2024',
      initials: 'JS',
      initialsColor: 'bg-blue-100 text-blue-700'
    }
  ];

  isDeleteModalOpen = false;
  isAddModalOpen = false;
  selectedAdmin: SuperAdmin | null = null;

  // Add admin form fields
  newAdminName = '';
  newAdminEmail = '';

  openDeleteModal(admin: SuperAdmin) {
    this.selectedAdmin = admin;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.selectedAdmin = null;
  }

  confirmDelete() {
    if (this.selectedAdmin) {
      this.superAdmins = this.superAdmins.filter(admin => admin.id !== this.selectedAdmin!.id);
      this.closeDeleteModal();
    }
  }

  openAddModal() {
    this.isAddModalOpen = true;
    this.newAdminName = '';
    this.newAdminEmail = '';
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newAdminName = '';
    this.newAdminEmail = '';
  }

  addSuperAdmin() {
    if (this.newAdminName.trim() && this.newAdminEmail.trim()) {
      const initials = this.getInitials(this.newAdminName);
      const newAdmin: SuperAdmin = {
        id: Date.now().toString(),
        name: this.newAdminName.trim(),
        email: this.newAdminEmail.trim(),
        addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        initials: initials,
        initialsColor: 'bg-blue-100 text-blue-700'
      };
      this.superAdmins.push(newAdmin);
      this.closeAddModal();
    }
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  get isAddFormValid(): boolean {
    return this.newAdminName.trim().length > 0 && this.newAdminEmail.trim().length > 0;
  }
}