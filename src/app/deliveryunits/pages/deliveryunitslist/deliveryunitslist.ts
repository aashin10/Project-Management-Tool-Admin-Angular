import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from "../../../shared/table/table";
import { Sectiontitle } from "../../../shared/sectiontitle/sectiontitle";
import { CustomButton } from "../../../shared/custom-button/custom-button";
import { SearchBar } from "../../../shared/components/search-bar/search-bar";
import { CommonModule } from '@angular/common';
import { Modal } from "../../../shared/modal/modal";
import { FormsModule } from '@angular/forms';
import { DeliveryUnitService, DeliveryUnitApi } from '../../../duservice/deliveryunits.service';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';

@Component({
  selector: 'app-deliveryunitslist',
  standalone: true,
  imports: [Table, Sectiontitle, CustomButton, SearchBar, CommonModule, Modal, FormsModule,LoadingIndicator],
  templateUrl: './deliveryunitslist.html',
  styleUrl: './deliveryunitslist.css'
})
export class Deliveryunitslist implements OnInit {
  searchQuery: string = '';
  filteredDeliveryUnits: any[] = [];
  isModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isUpdateConfirmModalOpen: boolean = false;
  selectedDeliveryUnits: any[] = [];
  private _resetPagination: boolean = false;
  isEditMode: boolean = false;
  editingDUId: number = 0;
  isLoading: boolean = false;
  duToDelete: any = null;
  deleteConfirmationText: string = '';
  
  // Toast notification properties
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  get resetPagination(): boolean {
    return this._resetPagination;
  }

  set resetPagination(value: boolean) {
    this._resetPagination = value;
    if (value) setTimeout(() => (this._resetPagination = false), 0);
  }

  newDU = {
    name: '',
    code: '',
    description: '',
    headName: '',
    headEmail: ''
  };

  private duColors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500'];
  private deliveryUnitsFromApi: DeliveryUnitApi[] = [];

  columns = [
    { header: 'Delivery Unit Info', field: 'duInfo', type: 'avatar' as const, width: '30%' },
    { header: 'DU Code', field: 'duCode', type: 'text' as const, align: 'left' as const },
    { header: 'DU Head', field: 'duHead', type: 'user' as const },
    { header: 'Active Projects', field: 'activeProjects', type: 'text' as const, align: 'left' as const, icon: 'images/Project-icon.svg', iconPosition: 'left' as const },
    { header: 'Actions', field: 'actions', type: 'actions' as const, actions: [
        { label: 'Edit DU', icon: 'images/edit.svg', action: 'edit' },
        { label: 'Delete DU', icon: 'images/delete.svg', action: 'delete', class: 'danger' }
      ]
    }
  ];

  deliveryUnits: any[] = [];

  constructor(
    private router: Router,
    private deliveryUnitService: DeliveryUnitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDeliveryUnits();
  }

  showToastNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast(): void {
    this.showToast = false;
    this.cdr.detectChanges();
  }

  // 🧠 Load delivery units
  loadDeliveryUnits(): void {
    this.isLoading = true;
    this.deliveryUnitService.getAllDeliveryUnits().subscribe({
      next: (data: DeliveryUnitApi[]) => {
        this.deliveryUnitsFromApi = data;
        this.deliveryUnits = this.transformApiDataToTableFormat(data);
        this.updateFilteredDeliveryUnits();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showToastNotification('Failed to load delivery units', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  transformApiDataToTableFormat(apiData: DeliveryUnitApi[]): any[] {
    return apiData.map(du => ({
      id: du.id,
      duInfo: {
        name: du.name || 'Unnamed DU',
        subtitle: du.description || 'No description',
        initials: this.getInitials(du.name || 'DU'),
        bgColor: this.getRandomColor()
      },
      duCode: du.code || 'N/A',
      duHead: {
        name: du.duHeadName || 'Unassigned',
        email: du.duHeadEmail || 'no-email@example.com',
        avatar: this.getInitials(du.duHeadName || 'DU')
      },
      activeProjects: du.projectCount ?? 0
    }));
  }

  onAddNewDU(): void {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.resetForm();
    this.cdr.detectChanges();
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingDUId = 0;
    this.isLoading = false;
    this.resetForm();
    this.cdr.detectChanges();
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.duToDelete = null;
    this.cdr.detectChanges();
  }

  onCloseUpdateConfirmModal(): void {
    this.isUpdateConfirmModalOpen = false;
    this.cdr.detectChanges();
  }

  resetForm(): void {
    this.newDU = { name: '', code: '', description: '', headName: '', headEmail: '' };
  }

  onDUNameChange(): void {
    if (!this.isEditMode && this.newDU.name) {
      const prefix = this.newDU.name.trim().split(' ')[0].substring(0, 3).toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.newDU.code = `${prefix}-${randomNum}`;
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getRandomColor(): string {
    return this.duColors[Math.floor(Math.random() * this.duColors.length)];
  }

  validateForm(): boolean {
    if (!this.newDU.name.trim() || !this.newDU.code.trim() || !this.newDU.description.trim() ||
        !this.newDU.headName.trim() || !this.newDU.headEmail.trim()) {
      this.showToastNotification('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  }

  onSubmitForm(): void {
    if (!this.validateForm()) return;
    
    if (this.isEditMode) {
      this.isUpdateConfirmModalOpen = true;
    } else {
      this.saveDeliveryUnit();
    }
  }

  confirmUpdate(): void {
    this.isUpdateConfirmModalOpen = false;
    this.saveDeliveryUnit();
  }

  saveDeliveryUnit(): void {
    this.isLoading = true;
    const duData = {
      duName: this.newDU.name.trim(),
      duCode: this.newDU.code.trim().toUpperCase(),
      description: this.newDU.description.trim(),
      duHeadName: this.newDU.headName.trim(),
      duHeadEmail: this.newDU.headEmail.trim()
    };

    if (this.isEditMode) {
      this.deliveryUnitService.updateDeliveryUnit(this.editingDUId, duData).subscribe({
        next: () => {
          this.showToastNotification('Delivery Unit updated successfully');
          this.loadDeliveryUnits();
          this.onCloseModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.showToastNotification(`Failed to update: ${error.message}`, 'error');
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false)
      });
    } else {
      this.deliveryUnitService.createDeliveryUnit(duData).subscribe({
        next: () => {
          this.showToastNotification('Delivery Unit created successfully');
          this.loadDeliveryUnits();
          this.onCloseModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.showToastNotification(`Failed to create: ${error.message}`, 'error');
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false)
      });
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.resetPagination = true;
    this.updateFilteredDeliveryUnits();
    this.cdr.detectChanges();
  }

  updateFilteredDeliveryUnits(): void {
    if (!this.searchQuery) {
      this.filteredDeliveryUnits = [...this.deliveryUnits];
    } else {
      this.filteredDeliveryUnits = this.deliveryUnits.filter(du =>
        du.duInfo.name.toLowerCase().includes(this.searchQuery) ||
        du.duInfo.subtitle.toLowerCase().includes(this.searchQuery) ||
        du.duCode.toLowerCase().includes(this.searchQuery) ||
        du.duHead.name.toLowerCase().includes(this.searchQuery) ||
        du.duHead.email.toLowerCase().includes(this.searchQuery)
      );
    }
    this.cdr.detectChanges();
  }

  onActionClick(event: { action: string, row: any }): void {
    const duRow = event.row;
    switch (event.action) {
      case 'edit': this.editDeliveryUnit(duRow); break;
      case 'view': this.viewDeliveryUnit(duRow); break;
      case 'delete': this.deleteDeliveryUnit(duRow); break;
    }
  }

  editDeliveryUnit(du: any): void {
    const originalDU = this.deliveryUnitsFromApi.find(apiDU => apiDU.code === du.duCode);
    if (!originalDU) {
      this.showToastNotification('Could not find delivery unit data', 'error');
      return;
    }

    this.isEditMode = true;
    this.editingDUId = originalDU.id;
    this.newDU = {
      name: originalDU.name || '',
      code: originalDU.code || '',
      description: originalDU.description || '',
      headName: originalDU.duHeadName || '',
      headEmail: originalDU.duHeadEmail || ''
    };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  viewDeliveryUnit(du: any): void {
    this.router.navigate(['/delivery-units/view', du.duCode]);
  }

  deleteDeliveryUnit(du: any): void {
    const duId = du?.id;
    const duName = du?.duInfo?.name || du?.name || 'this Delivery Unit';

    if (!duId) return;
    
    this.duToDelete = du;
    this.deleteConfirmationText = duName;
    this.isDeleteModalOpen = true;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.duToDelete) return;

    const duId = this.duToDelete.id;

    this.filteredDeliveryUnits = this.filteredDeliveryUnits.filter(item => item.id !== duId);
    this.deliveryUnits = this.deliveryUnits.filter(item => item.id !== duId);
    this.onCloseDeleteModal();
    this.cdr.detectChanges();

    this.deliveryUnitService.deleteDeliveryUnit(duId).subscribe({
      next: () => {
        this.showToastNotification('Delivery Unit deleted successfully');
        this.loadDeliveryUnits();
      },
      error: (err) => {
        this.showToastNotification('Failed to delete. Please try again', 'error');
        this.loadDeliveryUnits();
      }
    });
  }
}