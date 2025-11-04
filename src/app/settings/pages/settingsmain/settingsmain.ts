import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Modal } from '../../../shared/modal/modal';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../shared/services/notification.service';
import { SuperAdminDTO, SuperAdminService } from './super-admin-service';

interface SuperAdmin {
  id: number;
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
export class Settingsmain implements OnInit {
  private toastr = inject(ToastrService);
  private notificationService = inject(NotificationService);
  private superAdminService = inject(SuperAdminService);
  private cdr = inject(ChangeDetectorRef);

  superAdmins: SuperAdmin[] = [];
  isLoading = false;

  isDeleteModalOpen = false;
  isAddModalOpen = false;
  isEditModalOpen = false;
  selectedAdmin: SuperAdmin | null = null;

  // Add admin form fields
  newAdminName = '';
  newAdminEmail = '';
  newAdminStatus = true;
  addEmailError = '';

  // Edit admin form fields
  editAdminName = '';
  editAdminEmail = '';
  editAdminStatus = true;
  editEmailError = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];

  // Search
  searchQuery = '';

  ngOnInit() {
    console.log('Settings component initialized, fetching super admins...');
    this.loadSuperAdmins();
  }

  /**
   * Load all super admins from API
   */
  loadSuperAdmins() {
    console.log('Fetching super admins from API...');
    this.isLoading = true;
    this.superAdminService.getAllSuperAdmins().subscribe({
      next: (data) => {
        console.log('✅ Received data from API:', data);
        console.log('Number of super admins:', data.length);
        this.superAdmins = data.map(admin => this.mapDTOToSuperAdmin(admin));
        console.log('Mapped super admins:', this.superAdmins);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading super admins:', error);
        this.toastr.error('Failed to load super admins', 'Error');
        this.superAdmins = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Map DTO from API to internal SuperAdmin interface
   */
  private mapDTOToSuperAdmin(dto: SuperAdminDTO): SuperAdmin {
    return {
      id: dto.id!,
      name: dto.name,
      email: dto.email,
      addedDate: this.formatDate(dto.createdAt!),
      initials: this.getInitials(dto.name),
      initialsColor: 'bg-blue-100 text-blue-700',
      isActive: dto.isActive
    };
  }

  /**
   * Format date string
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

    /**
   * Return the number of active superadmins currently in local array.
   * We assume the API returns all non-deleted admins (matching backend repo).
   */
  private getActiveSuperAdminCount(): number {
    return this.superAdmins.filter(a => a.isActive).length;
  }

    /**
   * Frontend rule: disable delete when deleting `admin` would leave
   * 0 active superadmins. That is: if admin.isActive && activeCount <= 1 -> disabled.
   */
  isDeleteDisabled(admin: SuperAdmin): boolean {
    const activeCount = this.getActiveSuperAdminCount();
    return !!(admin.isActive && activeCount <= 1);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }


  /**
   * Check if email already exists in the system
   */
  private isEmailExists(email: string, excludeId?: number): boolean {
    return this.superAdmins.some(admin => 
      admin.email.toLowerCase() === email.toLowerCase() && 
      admin.id !== excludeId
    );
  }

  openDeleteModal(admin: SuperAdmin) {
    // Guard in UI as well
    if (this.isDeleteDisabled(admin)) {
      this.toastr.warning('Cannot delete the only active Super Admin. At least one active Super Admin must remain.', 'Action blocked', {
        timeOut: 4000,
      });
      return;
    }
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
      const adminId = this.selectedAdmin.id;
      
      this.superAdminService.deleteSuperAdmin(adminId).subscribe({
        next: () => {
          // Remove from local array
          this.superAdmins = this.superAdmins.filter(admin => admin.id !== adminId);
          
          // Close modal first
          this.closeDeleteModal();
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Show toast popup notification
          this.toastr.success('Super Admin Deleted Successfully', '', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
          });
          
          // Add notification to notification service
          this.notificationService.addNotification(
            'success',
            `Super admin "${adminName}" has been successfully removed from the system.`,
            'Admin Deleted'
          );
        },
        error: (error) => {
          console.error('Error deleting super admin:', error);
          this.toastr.error('Failed to delete super admin', 'Error');
          this.closeDeleteModal();
        }
      });
    }
  }

  openAddModal() {
    this.isAddModalOpen = true;
    this.newAdminName = '';
    this.newAdminEmail = '';
    this.newAdminStatus = true;
    this.addEmailError = '';
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.newAdminName = '';
    this.newAdminEmail = '';
    this.newAdminStatus = true;
    this.addEmailError = '';
  }

  openEditModal(admin: SuperAdmin) {
    this.selectedAdmin = admin;
    this.editAdminName = admin.name;
    this.editAdminEmail = admin.email;
    this.editAdminStatus = admin.isActive;
    this.editEmailError = '';
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedAdmin = null;
    this.editAdminName = '';
    this.editAdminEmail = '';
    this.editAdminStatus = true;
    this.editEmailError = '';
  }

  confirmEdit() {
    if (this.selectedAdmin && this.isEditFormValid) {
      // Validate email format
      if (!this.isValidEmail(this.editAdminEmail.trim())) {
        this.editEmailError = 'Please enter a valid email address (e.g., user@example.com)';
        return;
      }

      // Check if email already exists (excluding current admin)
      if (this.isEmailExists(this.editAdminEmail.trim(), this.selectedAdmin.id)) {
        this.editEmailError = 'This email address is already in use by another admin';
        return;
      }

      this.editEmailError = '';

      const adminDTO: SuperAdminDTO = {
        id: this.selectedAdmin.id,
        name: this.editAdminName.trim(),
        email: this.editAdminEmail.trim(),
        isActive: this.editAdminStatus
      };

      const selectedAdminName = this.editAdminName.trim();
      const selectedAdminId = this.selectedAdmin.id;

      this.isLoading = true;
      this.superAdminService.updateSuperAdmin(selectedAdminId, adminDTO).subscribe({
        next: (updatedAdmin) => {
          // Update local array
          const index = this.superAdmins.findIndex(admin => admin.id === selectedAdminId);
          if (index !== -1) {
            this.superAdmins[index] = this.mapDTOToSuperAdmin(updatedAdmin);
          }
          
          // Close modal first
          this.closeEditModal();
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Show toast popup notification
          this.toastr.success('Super Admin Updated Successfully', '', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
          });
          
          // Add notification to notification service
          this.notificationService.addNotification(
            'success',
            `Super admin "${selectedAdminName}" has been successfully updated.`,
            'Admin Updated'
          );
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating super admin:', error);
          this.toastr.error('Failed to update super admin', 'Error');
          this.isLoading = false;
          this.closeEditModal();
        }
      });
    }
  }

  addSuperAdmin() {
    if (this.isAddFormValid) {
      // Validate email format
      if (!this.isValidEmail(this.newAdminEmail.trim())) {
        this.addEmailError = 'Please enter a valid email address (e.g., user@example.com)';
        return;
      }

      // Check if email already exists
      if (this.isEmailExists(this.newAdminEmail.trim())) {
        this.addEmailError = 'This email address is already in use by another admin';
        return;
      }

      this.addEmailError = '';

      const adminDTO: SuperAdminDTO = {
        name: this.newAdminName.trim(),
        email: this.newAdminEmail.trim(),
        isActive: this.newAdminStatus
      };

      const newAdminName = this.newAdminName.trim();

      this.isLoading = true;
      this.superAdminService.addSuperAdmin(adminDTO).subscribe({
        next: (newAdmin) => {
          // Add to local array
          this.superAdmins.push(this.mapDTOToSuperAdmin(newAdmin));
          
          // Close modal first
          this.closeAddModal();
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Show toast popup notification
          // this.toastr.success('Super Admin Added Successfully', '', {
          //   timeOut: 3000,
          //   progressBar: true,
          //   closeButton: true,
          // });
                   this.toastr.success(
            `Login credentials have been sent to ${this.newAdminEmail.trim()}`, 
            'Super Admin Added Successfully', 
            {
              timeOut: 5000,
              progressBar: true,
              closeButton: true,
            }
          );
          
          // Add notification to notification service
          // this.notificationService.addNotification(
          //   'success',
          //   `Super admin "${newAdminName}" has been successfully added to the system.`,
          //   'Admin Added'
          // );
                    this.notificationService.addNotification(
            'success',
            `Super admin "${newAdminName}" has been successfully added to the system. Login credentials have been sent.`,
            'Admin Added'
          );
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error adding super admin:', error);
          this.toastr.error('Failed to add super admin', 'Error');
          this.isLoading = false;
          this.closeAddModal();
        }
      });
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
    return this.newAdminName.trim().length > 0 && 
           this.newAdminEmail.trim().length > 0 && 
           this.isValidEmail(this.newAdminEmail.trim()) &&
           !this.isEmailExists(this.newAdminEmail.trim());
  }

  get isEditFormValid(): boolean {
    return this.editAdminName.trim().length > 0 && 
           this.editAdminEmail.trim().length > 0 && 
           this.isValidEmail(this.editAdminEmail.trim()) &&
           !this.isEmailExists(this.editAdminEmail.trim(), this.selectedAdmin?.id);
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








//------------------------------------------------------------------------------
// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
// import { CustomButton } from '../../../shared/custom-button/custom-button';
// import { Modal } from '../../../shared/modal/modal';
// import { SearchBar } from '../../../shared/components/search-bar/search-bar';
// import { ToastrService } from 'ngx-toastr';
// import { NotificationService } from '../../../shared/services/notification.service';
// import { SuperAdminDTO, SuperAdminService } from './super-admin-service';

// interface SuperAdmin {
//   id: number;
//   name: string;
//   email: string;
//   addedDate: string;
//   initials: string;
//   initialsColor: string;
//   isActive: boolean;
// }

// @Component({
//   selector: 'app-settingsmain',
//   standalone: true,
//   imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, Modal, SearchBar],
//   templateUrl: './settingsmain.html',
//   styleUrl: './settingsmain.css'
// })
// export class Settingsmain implements OnInit {
//   private toastr = inject(ToastrService);
//   private notificationService = inject(NotificationService);
//   private superAdminService = inject(SuperAdminService);

//   superAdmins: SuperAdmin[] = [];
//   isLoading = false;

//   isDeleteModalOpen = false;
//   isAddModalOpen = false;
//   isEditModalOpen = false;
//   selectedAdmin: SuperAdmin | null = null;

//   // Add admin form fields
//   newAdminName = '';
//   newAdminEmail = '';
//   newAdminStatus = true;
//   addEmailError = '';

//   // Edit admin form fields
//   editAdminName = '';
//   editAdminEmail = '';
//   editAdminStatus = true;
//   editEmailError = '';

//   // Pagination
//   currentPage = 1;
//   itemsPerPage = 10;
//   pageSizeOptions = [5, 10, 20, 50];

//   // Search
//   searchQuery = '';

//   ngOnInit() {
//     this.loadSuperAdmins();
//   }

//   /**
//    * Load all super admins from API
//    */
//   loadSuperAdmins() {
//     this.isLoading = true;
//     this.superAdminService.getAllSuperAdmins().subscribe({
//       next: (data) => {
//         this.superAdmins = data.map(admin => this.mapDTOToSuperAdmin(admin));
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error loading super admins:', error);
//         this.toastr.error('Failed to load super admins', 'Error');
//         this.isLoading = false;
//       }
//     });
//   }

//   /**
//    * Map DTO from API to internal SuperAdmin interface
//    */
//   private mapDTOToSuperAdmin(dto: SuperAdminDTO): SuperAdmin {
//     return {
//       id: dto.id!,
//       name: dto.name,
//       email: dto.email,
//       addedDate: this.formatDate(dto.createdAt!),
//       initials: this.getInitials(dto.name),
//       initialsColor: 'bg-blue-100 text-blue-700',
//       isActive: dto.isActive
//     };
//   }

//   /**
//    * Format date string
//    */
//   private formatDate(dateString: string): string {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   }

//   /**
//    * Validate email format
//    */
//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(email);
//   }

//   /**
//    * Check if email already exists in the system
//    */
//   private isEmailExists(email: string, excludeId?: number): boolean {
//     return this.superAdmins.some(admin => 
//       admin.email.toLowerCase() === email.toLowerCase() && 
//       admin.id !== excludeId
//     );
//   }

//   openDeleteModal(admin: SuperAdmin) {
//     this.selectedAdmin = admin;
//     this.isDeleteModalOpen = true;
//   }

//   closeDeleteModal() {
//     this.isDeleteModalOpen = false;
//     this.selectedAdmin = null;
//   }

//   confirmDelete() {
//     if (this.selectedAdmin) {
//       const adminName = this.selectedAdmin.name;
//       const adminId = this.selectedAdmin.id;
      
//       this.superAdminService.deleteSuperAdmin(adminId).subscribe({
//         next: () => {
//           // Remove from local array
//           this.superAdmins = this.superAdmins.filter(admin => admin.id !== adminId);
          
//           // Show toast popup notification
//           this.toastr.success('Super Admin Deleted Successfully', '', {
//             timeOut: 3000,
//             progressBar: true,
//             closeButton: true,
//           });
          
//           // Add notification to notification service
//           this.notificationService.addNotification(
//             'success',
//             `Super admin "${adminName}" has been successfully removed from the system.`,
//             'Admin Deleted'
//           );
          
//           this.closeDeleteModal();
//         },
//         error: (error) => {
//           console.error('Error deleting super admin:', error);
//           this.toastr.error('Failed to delete super admin', 'Error');
//           this.closeDeleteModal();
//         }
//       });
//     }
//   }

//   openAddModal() {
//     this.isAddModalOpen = true;
//     this.newAdminName = '';
//     this.newAdminEmail = '';
//     this.newAdminStatus = true;
//     this.addEmailError = '';
//   }

//   closeAddModal() {
//     this.isAddModalOpen = false;
//     this.newAdminName = '';
//     this.newAdminEmail = '';
//     this.newAdminStatus = true;
//     this.addEmailError = '';
//   }

//   openEditModal(admin: SuperAdmin) {
//     this.selectedAdmin = admin;
//     this.editAdminName = admin.name;
//     this.editAdminEmail = admin.email;
//     this.editAdminStatus = admin.isActive;
//     this.editEmailError = '';
//     this.isEditModalOpen = true;
//   }

//   closeEditModal() {
//     this.isEditModalOpen = false;
//     this.selectedAdmin = null;
//     this.editAdminName = '';
//     this.editAdminEmail = '';
//     this.editAdminStatus = true;
//     this.editEmailError = '';
//   }

//   confirmEdit() {
//     if (this.selectedAdmin && this.isEditFormValid) {
//       // Validate email format
//       if (!this.isValidEmail(this.editAdminEmail.trim())) {
//         this.editEmailError = 'Please enter a valid email address (e.g., user@example.com)';
//         return;
//       }

//       // Check if email already exists (excluding current admin)
//       if (this.isEmailExists(this.editAdminEmail.trim(), this.selectedAdmin.id)) {
//         this.editEmailError = 'This email address is already in use by another admin';
//         return;
//       }

//       this.editEmailError = '';

//       const adminDTO: SuperAdminDTO = {
//         id: this.selectedAdmin.id,
//         name: this.editAdminName.trim(),
//         email: this.editAdminEmail.trim(),
//         isActive: this.editAdminStatus
//       };

//       this.isLoading = true;
//       this.superAdminService.updateSuperAdmin(this.selectedAdmin.id, adminDTO).subscribe({
//         next: (updatedAdmin) => {
//           // Update local array
//           const index = this.superAdmins.findIndex(admin => admin.id === this.selectedAdmin!.id);
//           if (index !== -1) {
//             this.superAdmins[index] = this.mapDTOToSuperAdmin(updatedAdmin);
//           }
          
//           // Show toast popup notification
//           this.toastr.success('Super Admin Updated Successfully', '', {
//             timeOut: 3000,
//             progressBar: true,
//             closeButton: true,
//           });
          
//           // Add notification to notification service
//           this.notificationService.addNotification(
//             'success',
//             `Super admin "${this.editAdminName.trim()}" has been successfully updated.`,
//             'Admin Updated'
//           );
          
//           this.isLoading = false;
//           this.closeEditModal();
//         },
//         error: (error) => {
//           console.error('Error updating super admin:', error);
//           this.toastr.error('Failed to update super admin', 'Error');
//           this.isLoading = false;
//         }
//       });
//     }
//   }

//   addSuperAdmin() {
//     if (this.isAddFormValid) {
//       // Validate email format
//       if (!this.isValidEmail(this.newAdminEmail.trim())) {
//         this.addEmailError = 'Please enter a valid email address (e.g., user@example.com)';
//         return;
//       }

//       // Check if email already exists
//       if (this.isEmailExists(this.newAdminEmail.trim())) {
//         this.addEmailError = 'This email address is already in use by another admin';
//         return;
//       }

//       this.addEmailError = '';

//       const adminDTO: SuperAdminDTO = {
//         name: this.newAdminName.trim(),
//         email: this.newAdminEmail.trim(),
//         isActive: this.newAdminStatus
//       };

//       this.isLoading = true;
//       this.superAdminService.addSuperAdmin(adminDTO).subscribe({
//         next: (newAdmin) => {
//           // Add to local array
//           this.superAdmins.push(this.mapDTOToSuperAdmin(newAdmin));
          
//           // Show toast popup notification
//           this.toastr.success('Super Admin Added Successfully', '', {
//             timeOut: 3000,
//             progressBar: true,
//             closeButton: true,
//           });
          
//           // Add notification to notification service
//           this.notificationService.addNotification(
//             'success',
//             `Super admin "${this.newAdminName.trim()}" has been successfully added to the system.`,
//             'Admin Added'
//           );
          
//           this.isLoading = false;
//           this.closeAddModal();
//         },
//         error: (error) => {
//           console.error('Error adding super admin:', error);
//           this.toastr.error('Failed to add super admin', 'Error');
//           this.isLoading = false;
//         }
//       });
//     }
//   }

//   private getInitials(name: string): string {
//     const parts = name.trim().split(' ');
//     if (parts.length >= 2) {
//       return (parts[0][0] + parts[1][0]).toUpperCase();
//     }
//     return parts[0].substring(0, 2).toUpperCase();
//   }

//   get isAddFormValid(): boolean {
//     return this.newAdminName.trim().length > 0 && 
//            this.newAdminEmail.trim().length > 0 && 
//            this.isValidEmail(this.newAdminEmail.trim()) &&
//            !this.isEmailExists(this.newAdminEmail.trim());
//   }

//   get isEditFormValid(): boolean {
//     return this.editAdminName.trim().length > 0 && 
//            this.editAdminEmail.trim().length > 0 && 
//            this.isValidEmail(this.editAdminEmail.trim()) &&
//            !this.isEmailExists(this.editAdminEmail.trim(), this.selectedAdmin?.id);
//   }

//   // Pagination computed properties
//   get filteredAdmins(): SuperAdmin[] {
//     if (!this.searchQuery.trim()) {
//       return this.superAdmins;
//     }
    
//     const query = this.searchQuery.toLowerCase().trim();
//     return this.superAdmins.filter(admin => 
//       admin.name.toLowerCase().includes(query) ||
//       admin.email.toLowerCase().includes(query)
//     );
//   }

//   get totalPages(): number {
//     return Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
//   }

//   get paginatedAdmins(): SuperAdmin[] {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     return this.filteredAdmins.slice(startIndex, endIndex);
//   }

//   get startIndex(): number {
//     if (this.filteredAdmins.length === 0) return 0;
//     return (this.currentPage - 1) * this.itemsPerPage + 1;
//   }

//   get endIndex(): number {
//     return Math.min(this.currentPage * this.itemsPerPage, this.filteredAdmins.length);
//   }

//   get pageNumbers(): number[] {
//     const pages: number[] = [];
//     const maxVisible = 5;
    
//     if (this.totalPages <= maxVisible) {
//       for (let i = 1; i <= this.totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (this.currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pages.push(i);
//         }
//         pages.push(-1); // ellipsis
//         pages.push(this.totalPages);
//       } else if (this.currentPage >= this.totalPages - 2) {
//         pages.push(1);
//         pages.push(-1); // ellipsis
//         for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
//           pages.push(i);
//         }
//       } else {
//         pages.push(1);
//         pages.push(-1); // ellipsis
//         for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
//           pages.push(i);
//         }
//         pages.push(-1); // ellipsis
//         pages.push(this.totalPages);
//       }
//     }
    
//     return pages;
//   }

//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }

//   goToFirstPage(): void {
//     this.currentPage = 1;
//   }

//   goToLastPage(): void {
//     this.currentPage = this.totalPages;
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//     }
//   }

//   previousPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   changePageSize(event: Event): void {
//     const select = event.target as HTMLSelectElement;
//     this.itemsPerPage = parseInt(select.value, 10);
//     this.currentPage = 1;
//   }

//   onSearch(query: string): void {
//     this.searchQuery = query;
//     this.currentPage = 1; // Reset to first page when searching
//   }
// }














// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
// import { CustomButton } from '../../../shared/custom-button/custom-button';
// import { Modal } from '../../../shared/modal/modal';
// import { SearchBar } from '../../../shared/components/search-bar/search-bar';
// import { ToastrService } from 'ngx-toastr';
// import { NotificationService } from '../../../shared/services/notification.service';


// interface SuperAdmin {
//   id: string;
//   name: string;
//   email: string;
//   addedDate: string;
//   initials: string;
//   initialsColor: string;
//   isActive: boolean;
// }

// @Component({
//   selector: 'app-settingsmain',
//   standalone: true,
//   imports: [CommonModule, FormsModule, Sectiontitle, CustomButton, Modal, SearchBar],
//   templateUrl: './settingsmain.html',
//   styleUrl: './settingsmain.css'
// })
// export class Settingsmain {
//   private toastr = inject(ToastrService);
//   private notificationService = inject(NotificationService);

//   superAdmins: SuperAdmin[] = [
//     {
//       id: '1',
//       name: 'Sharath Shetty',
//       email: 'sharat.shetty@company.com',
//       addedDate: 'Jan 15, 2024',
//       initials: 'SS',
//       initialsColor: 'bg-blue-100 text-blue-700',
//       isActive: true
//     },
//     {
//       id: '2',
//       name: 'Aiman Khan',
//       email: 'aiman.khan@company.com',
//       addedDate: 'Feb 20, 2024',
//       initials: 'JS',
//       initialsColor: 'bg-blue-100 text-blue-700',
//       isActive: false
//     }
//   ];

//   isDeleteModalOpen = false;
//   isAddModalOpen = false;
//   isEditModalOpen = false;
//   selectedAdmin: SuperAdmin | null = null;

//   // Add admin form fields
//   newAdminName = '';
//   newAdminEmail = '';
//   newAdminStatus = true;

//   // Edit admin form fields
//   editAdminName = '';
//   editAdminEmail = '';
//   editAdminStatus = true;

//   // Pagination
//   currentPage = 1;
//   itemsPerPage = 10;
//   pageSizeOptions = [5, 10, 20, 50];

//   // Search
//   searchQuery = '';

//   openDeleteModal(admin: SuperAdmin) {
//     this.selectedAdmin = admin;
//     this.isDeleteModalOpen = true;
//   }

//   closeDeleteModal() {
//     this.isDeleteModalOpen = false;
//     this.selectedAdmin = null;
//   }

//   confirmDelete() {
//     if (this.selectedAdmin) {
//       const adminName = this.selectedAdmin.name;
//       this.superAdmins = this.superAdmins.filter(admin => admin.id !== this.selectedAdmin!.id);
      
//       // Show toast popup notification
//       this.toastr.success('Super Admin Deleted Successfully', '', {
//         timeOut: 3000,
//         progressBar: true,
//         closeButton: true,
//       });
      
//       // Add notification to notification service (stored in localStorage)
//       this.notificationService.addNotification(
//         'success',
//         `Super admin "${adminName}" has been successfully removed from the system.`,
//         'Admin Deleted'
//       );
      
//       this.closeDeleteModal();
//     }
//   }

//   openAddModal() {
//     this.isAddModalOpen = true;
//     this.newAdminName = '';
//     this.newAdminEmail = '';
//     this.newAdminStatus = true;
//   }

//   closeAddModal() {
//     this.isAddModalOpen = false;
//     this.newAdminName = '';
//     this.newAdminEmail = '';
//     this.newAdminStatus = true;
//   }

//   openEditModal(admin: SuperAdmin) {
//     this.selectedAdmin = admin;
//     this.editAdminName = admin.name;
//     this.editAdminEmail = admin.email;
//     this.editAdminStatus = admin.isActive;
//     this.isEditModalOpen = true;
//   }

//   closeEditModal() {
//     this.isEditModalOpen = false;
//     this.selectedAdmin = null;
//     this.editAdminName = '';
//     this.editAdminEmail = '';
//     this.editAdminStatus = true;
//   }

//   confirmEdit() {
//     if (this.selectedAdmin && this.editAdminName.trim() && this.editAdminEmail.trim()) {
//       const index = this.superAdmins.findIndex(admin => admin.id === this.selectedAdmin!.id);
//       if (index !== -1) {
//         this.superAdmins[index] = {
//           ...this.superAdmins[index],
//           name: this.editAdminName.trim(),
//           email: this.editAdminEmail.trim(),
//           isActive: this.editAdminStatus,
//           initials: this.getInitials(this.editAdminName)
//         };
        
//         // Show toast popup notification
//         this.toastr.success('Super Admin Updated Successfully', '', {
//           timeOut: 3000,
//           progressBar: true,
//           closeButton: true,
//         });
        
//         // Add notification to notification service (stored in localStorage)
//         this.notificationService.addNotification(
//           'success',
//           `Super admin "${this.editAdminName.trim()}" has been successfully updated.`,
//           'Admin Updated'
//         );
//       }
//       this.closeEditModal();
//     }
//   }

//   addSuperAdmin() {
//     if (this.newAdminName.trim() && this.newAdminEmail.trim()) {
//       const initials = this.getInitials(this.newAdminName);
//       const newAdmin: SuperAdmin = {
//         id: Date.now().toString(),
//         name: this.newAdminName.trim(),
//         email: this.newAdminEmail.trim(),
//         addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
//         initials: initials,
//         initialsColor: 'bg-blue-100 text-blue-700',
//         isActive: this.newAdminStatus
//       };
//       this.superAdmins.push(newAdmin);
      
//       // Show toast popup notification
//       this.toastr.success('Super Admin Added Successfully', '', {
//         timeOut: 3000,
//         progressBar: true,
//         closeButton: true,
//       });
      
//       // Add notification to notification service (stored in localStorage)
//       this.notificationService.addNotification(
//         'success',
//         `Super admin "${this.newAdminName.trim()}" has been successfully added to the system.`,
//         'Admin Added'
//       );
      
//       this.closeAddModal();
//     }
//   }

//   private getInitials(name: string): string {
//     const parts = name.trim().split(' ');
//     if (parts.length >= 2) {
//       return (parts[0][0] + parts[1][0]).toUpperCase();
//     }
//     return parts[0].substring(0, 2).toUpperCase();
//   }

//   get isAddFormValid(): boolean {
//     return this.newAdminName.trim().length > 0 && this.newAdminEmail.trim().length > 0;
//   }

//   get isEditFormValid(): boolean {
//     return this.editAdminName.trim().length > 0 && this.editAdminEmail.trim().length > 0;
//   }

//   // Pagination computed properties
//   get filteredAdmins(): SuperAdmin[] {
//     if (!this.searchQuery.trim()) {
//       return this.superAdmins;
//     }
    
//     const query = this.searchQuery.toLowerCase().trim();
//     return this.superAdmins.filter(admin => 
//       admin.name.toLowerCase().includes(query) ||
//       admin.email.toLowerCase().includes(query)
//     );
//   }

//   get totalPages(): number {
//     return Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
//   }

//   get paginatedAdmins(): SuperAdmin[] {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     return this.filteredAdmins.slice(startIndex, endIndex);
//   }

//   get startIndex(): number {
//     if (this.filteredAdmins.length === 0) return 0;
//     return (this.currentPage - 1) * this.itemsPerPage + 1;
//   }

//   get endIndex(): number {
//     return Math.min(this.currentPage * this.itemsPerPage, this.filteredAdmins.length);
//   }

//   get pageNumbers(): number[] {
//     const pages: number[] = [];
//     const maxVisible = 5;
    
//     if (this.totalPages <= maxVisible) {
//       for (let i = 1; i <= this.totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (this.currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pages.push(i);
//         }
//         pages.push(-1); // ellipsis
//         pages.push(this.totalPages);
//       } else if (this.currentPage >= this.totalPages - 2) {
//         pages.push(1);
//         pages.push(-1); // ellipsis
//         for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
//           pages.push(i);
//         }
//       } else {
//         pages.push(1);
//         pages.push(-1); // ellipsis
//         for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
//           pages.push(i);
//         }
//         pages.push(-1); // ellipsis
//         pages.push(this.totalPages);
//       }
//     }
    
//     return pages;
//   }

//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//     }
//   }

//   goToFirstPage(): void {
//     this.currentPage = 1;
//   }

//   goToLastPage(): void {
//     this.currentPage = this.totalPages;
//   }

//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//     }
//   }

//   previousPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   changePageSize(event: Event): void {
//     const select = event.target as HTMLSelectElement;
//     this.itemsPerPage = parseInt(select.value, 10);
//     this.currentPage = 1;
//   }

//   onSearch(query: string): void {
//     this.searchQuery = query;
//     this.currentPage = 1; // Reset to first page when searching
//   }
// }