import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Modal } from '../../../shared/modal/modal';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../shared/services/notification.service';


interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  addedDate: string;
  initials: string;
  initialsColor: string;
  isActive: boolean;
}

@Component({
  selector: 'app-settingsmain',
  standalone: true,
  imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, Modal, SearchBar],
  templateUrl: './settingsmain.html',
  styleUrl: './settingsmain.css'
})
export class Settingsmain {
  private toastr = inject(ToastrService);
  private notificationService = inject(NotificationService);

  superAdmins: SuperAdmin[] = [
    {
      id: '1',
      name: 'Sharath Shetty',
      email: 'sharat.shetty@company.com',
      addedDate: 'Jan 15, 2024',
      initials: 'SS',
      initialsColor: 'bg-blue-100 text-blue-700',
      isActive: true
    },
    {
      id: '2',
      name: 'Aiman Khan',
      email: 'aiman.khan@company.com',
      addedDate: 'Feb 20, 2024',
      initials: 'JS',
      initialsColor: 'bg-blue-100 text-blue-700',
      isActive: false
    }
  ];

  isDeleteModalOpen = false;
  isAddModalOpen = false;
  isEditModalOpen = false;
  selectedAdmin: SuperAdmin | null = null;

  // Add admin form fields
  newAdminName = '';
  newAdminEmail = '';
  newAdminStatus = true;

  // Edit admin form fields
  editAdminName = '';
  editAdminEmail = '';
  editAdminStatus = true;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Search
  searchQuery = '';

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
      const adminName = this.selectedAdmin.name;
      this.superAdmins = this.superAdmins.filter(admin => admin.id !== this.selectedAdmin!.id);
      
      // Show toast popup notification
      this.toastr.success('Super Admin Deleted Successfully', '', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
      });
      
      // Add notification to notification service (stored in localStorage)
      this.notificationService.addNotification(
        'success',
        `Super admin "${adminName}" has been successfully removed from the system.`,
        'Admin Deleted'
      );
      
      this.closeDeleteModal();
    }
  }

  openAddModal() {
    this.isAddModalOpen = true;
    this.newAdminName = '';
    this.newAdminEmail = '';
    this.newAdminStatus = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newAdminName = '';
    this.newAdminEmail = '';
    this.newAdminStatus = true;
  }

  openEditModal(admin: SuperAdmin) {
    this.selectedAdmin = admin;
    this.editAdminName = admin.name;
    this.editAdminEmail = admin.email;
    this.editAdminStatus = admin.isActive;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedAdmin = null;
    this.editAdminName = '';
    this.editAdminEmail = '';
    this.editAdminStatus = true;
  }

  confirmEdit() {
    if (this.selectedAdmin && this.editAdminName.trim() && this.editAdminEmail.trim()) {
      const index = this.superAdmins.findIndex(admin => admin.id === this.selectedAdmin!.id);
      if (index !== -1) {
        this.superAdmins[index] = {
          ...this.superAdmins[index],
          name: this.editAdminName.trim(),
          email: this.editAdminEmail.trim(),
          isActive: this.editAdminStatus,
          initials: this.getInitials(this.editAdminName)
        };
        
        // Show toast popup notification
        this.toastr.success('Super Admin Updated Successfully', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true,
        });
        
        // Add notification to notification service (stored in localStorage)
        this.notificationService.addNotification(
          'success',
          `Super admin "${this.editAdminName.trim()}" has been successfully updated.`,
          'Admin Updated'
        );
      }
      this.closeEditModal();
    }
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
        initialsColor: 'bg-blue-100 text-blue-700',
        isActive: this.newAdminStatus
      };
      this.superAdmins.push(newAdmin);
      
      // Show toast popup notification
      this.toastr.success('Super Admin Added Successfully', '', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
      });
      
      // Add notification to notification service (stored in localStorage)
      this.notificationService.addNotification(
        'success',
        `Super admin "${this.newAdminName.trim()}" has been successfully added to the system.`,
        'Admin Added'
      );
      
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

  get isEditFormValid(): boolean {
    return this.editAdminName.trim().length > 0 && this.editAdminEmail.trim().length > 0;
  }

  // Pagination computed properties
  get filteredAdmins(): SuperAdmin[] {
    if (!this.searchQuery.trim()) {
      return this.superAdmins;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    return this.superAdmins.filter(admin => 
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
  }

  get paginatedAdmins(): SuperAdmin[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAdmins.slice(startIndex, endIndex);
  }

  get startIndex(): number {
    if (this.filteredAdmins.length === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredAdmins.length);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(select.value, 10);
    this.currentPage = 1;
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1; // Reset to first page when searching
  }
}