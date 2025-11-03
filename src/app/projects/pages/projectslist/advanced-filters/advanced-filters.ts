import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
  projectManagerId?: number;
  teamSize: number;
  selected?: boolean;
}

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-filters.html',
  styleUrl: './advanced-filters.css'
})
export class AdvancedFilters implements OnChanges {
  constructor(private cdr: ChangeDetectorRef) {}
  @Input() showFilters = false;
  @Input() projects: Project[] = [];
  @Input() statusOptions: {id: number, code: string}[] = [];
  @Input() deliveryUnitOptions: {id: number, code: string}[] = [];
  @Input() 
  set managerOptions(value: {id: number, name: string}[]) {
    this._managerOptions = value || [];
    this.updateFilteredManagers();
    // Trigger change detection immediately
    this.cdr.detectChanges();
  }
  get managerOptions(): {id: number, name: string}[] {
    return this._managerOptions;
  }
  private _managerOptions: {id: number, name: string}[] = [];
  
  // NEW: Accept initial filter values from parent
  @Input() 
  set initialSelectedStatusIds(value: number[]) {
    this._initialSelectedStatusIds = value || [];
    this.selectedStatusIds = [...this._initialSelectedStatusIds];
  }
  get initialSelectedStatusIds(): number[] {
    return this._initialSelectedStatusIds;
  }
  private _initialSelectedStatusIds: number[] = [];

  @Input()
  set initialSelectedDeliveryUnitIds(value: number[]) {
    this._initialSelectedDeliveryUnitIds = value || [];
    this.selectedDeliveryUnitIds = [...this._initialSelectedDeliveryUnitIds];
  }
  get initialSelectedDeliveryUnitIds(): number[] {
    return this._initialSelectedDeliveryUnitIds;
  }
  private _initialSelectedDeliveryUnitIds: number[] = [];

  @Input()
  set initialSelectedManagerIds(value: number[]) {
    this._initialSelectedManagerIds = value || [];
    this.selectedManagerIds = [...this._initialSelectedManagerIds];
  }
  get initialSelectedManagerIds(): number[] {
    return this._initialSelectedManagerIds;
  }
  private _initialSelectedManagerIds: number[] = [];

  @Output() filtersChanged = new EventEmitter<{
    selectedStatusIds: number[];
    selectedDeliveryUnitIds: number[];
    selectedManagerIds: number[];
  }>();

  get selectedStatusObjects(): {id: number, code: string}[] {
    return this.statusOptions.filter(status => this.selectedStatusIds.includes(status.id));
  }

  get selectedDeliveryUnitObjects(): {id: number, code: string}[] {
    return this.deliveryUnitOptions.filter(du => this.selectedDeliveryUnitIds.includes(du.id));
  }

  get selectedManagerObjects(): {id: number, name: string}[] {
    return this._managerOptions.filter(manager => this.selectedManagerIds.includes(manager.id));
  }

  // Filter state - now storing IDs
  selectedStatusIds: number[] = [];
  selectedDeliveryUnitIds: number[] = [];
  selectedManagerIds: number[] = [];

  // Manager search
  private _managerSearchQuery = '';
  showAllManagers = false;
  // Controls whether the manager list is expanded into a scrollable window
  showManagersExpanded = false;
  filteredManagers: {id: number, name: string}[] = [];

  // Modal state for showing all managers
  showManagerModal = false;
  private _modalSearchQuery = '';
  modalFilteredManagers: {id: number, name: string}[] = [];

  get managerSearchQuery(): string {
    return this._managerSearchQuery;
  }

  set managerSearchQuery(value: string) {
    this._managerSearchQuery = value;
    this.updateFilteredManagers();
  }

  get modalSearchQuery(): string {
    return this._modalSearchQuery;
  }

  set modalSearchQuery(value: string) {
    this._modalSearchQuery = value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle manager options changes
    if (changes['managerOptions']) {
      this.updateFilteredManagers();
      this.cdr.detectChanges();
    }
  }

  // Getters
  get hasActiveFilters(): boolean {
    return this.selectedStatusIds.length > 0 ||
           this.selectedDeliveryUnitIds.length > 0 ||
           this.selectedManagerIds.length > 0;
  }

  get uniqueManagers(): {id: number, name: string}[] {
    return this._managerOptions;
  }

  // Update filtered managers when options or search changes
  private updateFilteredManagers(): void {
    // Always show the full filtered list; the container is scrollable to prevent panel expansion
    if (!this._managerSearchQuery) {
      this.filteredManagers = [...this._managerOptions];
    } else {
      this.filteredManagers = this._managerOptions.filter(manager =>
        manager.name && manager.name.toLowerCase().includes(this._managerSearchQuery.toLowerCase())
      );
    }
  }

  get displayedManagerCount(): number {
    return this.filteredManagers.length;
  }

  get totalManagerCount(): number {
    if (!this._managerSearchQuery) {
      return this.uniqueManagers.length;
    }
    return this.uniqueManagers.filter(manager =>
      manager.name && manager.name.toLowerCase().includes(this._managerSearchQuery.toLowerCase())
    ).length;
  }

  getActiveFilterCount(): number {
    return this.selectedStatusIds.length +
           this.selectedDeliveryUnitIds.length +
           this.selectedManagerIds.length;
  }

  // Filter methods
  isStatusSelected(statusCode: string): boolean {
    const status = this.statusOptions.find(s => s.code === statusCode);
    return status ? this.selectedStatusIds.includes(status.id) : false;
  }

  isDeliveryUnitSelected(deliveryUnitCode: string): boolean {
    const du = this.deliveryUnitOptions.find(d => d.code === deliveryUnitCode);
    return du ? this.selectedDeliveryUnitIds.includes(du.id) : false;
  }

  isManagerSelected(managerId: number): boolean {
    return this.selectedManagerIds.includes(managerId);
  }

  toggleStatusFilter(statusCode: string): void {
    const status = this.statusOptions.find(s => s.code === statusCode);
    if (!status) return;
    
    const index = this.selectedStatusIds.indexOf(status.id);
    if (index > -1) {
      this.selectedStatusIds.splice(index, 1);
    } else {
      this.selectedStatusIds.push(status.id);
    }
    this.emitFiltersChanged();
  }

  toggleDeliveryUnitFilter(deliveryUnitCode: string): void {
    const du = this.deliveryUnitOptions.find(d => d.code === deliveryUnitCode);
    if (!du) return;
    
    const index = this.selectedDeliveryUnitIds.indexOf(du.id);
    if (index > -1) {
      this.selectedDeliveryUnitIds.splice(index, 1);
    } else {
      this.selectedDeliveryUnitIds.push(du.id);
    }
    this.emitFiltersChanged();
  }

  toggleManagerFilter(managerId: number): void {
    const index = this.selectedManagerIds.indexOf(managerId);
    if (index > -1) {
      this.selectedManagerIds.splice(index, 1);
    } else {
      this.selectedManagerIds.push(managerId);
    }
    this.emitFiltersChanged();
  }

  removeStatusFilter(statusCode: string): void {
    const status = this.statusOptions.find(s => s.code === statusCode);
    if (!status) return;
    this.selectedStatusIds = this.selectedStatusIds.filter(id => id !== status.id);
    this.emitFiltersChanged();
  }

  removeDeliveryUnitFilter(deliveryUnitCode: string): void {
    const du = this.deliveryUnitOptions.find(d => d.code === deliveryUnitCode);
    if (!du) return;
    this.selectedDeliveryUnitIds = this.selectedDeliveryUnitIds.filter(id => id !== du.id);
    this.emitFiltersChanged();
  }

  removeManagerFilter(managerId: number): void {
    this.selectedManagerIds = this.selectedManagerIds.filter(id => id !== managerId);
    this.emitFiltersChanged();
  }

  clearAllFilters(): void {
    this.selectedStatusIds = [];
    this.selectedDeliveryUnitIds = [];
    this.selectedManagerIds = [];
    this.emitFiltersChanged();
  }

  toggleShowAllManagers(): void {
    // Toggle the expanded (scrollable) view while keeping the legacy flag in sync
    this.showManagersExpanded = !this.showManagersExpanded;
    this.showAllManagers = this.showManagersExpanded;
    this.updateFilteredManagers();
  }

  // (was) scrollManagerList - no longer used. Kept intentionally blank for compatibility.

  openManagerModal(): void {
    this.showManagerModal = true;
    this._modalSearchQuery = '';
    this.updateModalManagersList();
  }

  closeManagerModal(): void {
    this.showManagerModal = false;
    this._modalSearchQuery = '';
  }

  updateModalManagersList(): void {
    if (!this._modalSearchQuery) {
      this.modalFilteredManagers = [...this._managerOptions];
    } else {
      this.modalFilteredManagers = this._managerOptions.filter(manager =>
        manager.name && manager.name.toLowerCase().includes(this._modalSearchQuery.toLowerCase())
      );
    }
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit({
      selectedStatusIds: [...this.selectedStatusIds],
      selectedDeliveryUnitIds: [...this.selectedDeliveryUnitIds],
      selectedManagerIds: [...this.selectedManagerIds]
    });
  }
}