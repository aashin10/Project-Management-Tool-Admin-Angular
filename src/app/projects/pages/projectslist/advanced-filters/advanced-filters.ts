import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Active' | 'Inactive' | 'Completed';
  deliveryUnit: string;
  projectManager: string;
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
  @Input() showFilters = false;
  @Input() projects: Project[] = [];
  @Input() statusOptions: string[] = [];
  @Input() deliveryUnitOptions: string[] = [];
  
  // NEW: Accept initial filter values from parent
  @Input() initialSelectedStatuses: string[] = [];
  @Input() initialSelectedDeliveryUnits: string[] = [];
  @Input() initialSelectedManagers: string[] = [];

  @Output() filtersChanged = new EventEmitter<{
    selectedStatuses: string[];
    selectedDeliveryUnits: string[];
    selectedManagers: string[];
  }>();

  // Filter state
  selectedStatuses: string[] = [];
  selectedDeliveryUnits: string[] = [];
  selectedManagers: string[] = [];

  // Manager search
  managerSearchQuery = '';
  showAllManagers = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Initialize filters from parent component if provided
    if (changes['initialSelectedStatuses'] && this.initialSelectedStatuses.length > 0) {
      this.selectedStatuses = [...this.initialSelectedStatuses];
    }
    if (changes['initialSelectedDeliveryUnits'] && this.initialSelectedDeliveryUnits.length > 0) {
      this.selectedDeliveryUnits = [...this.initialSelectedDeliveryUnits];
    }
    if (changes['initialSelectedManagers'] && this.initialSelectedManagers.length > 0) {
      this.selectedManagers = [...this.initialSelectedManagers];
    }
  }

  // Getters
  get hasActiveFilters(): boolean {
    return this.selectedStatuses.length > 0 ||
           this.selectedDeliveryUnits.length > 0 ||
           this.selectedManagers.length > 0;
  }

  get uniqueManagers(): string[] {
    return [...new Set(this.projects.map(p => p.projectManager))].sort();
  }

  get filteredManagers(): string[] {
    if (!this.managerSearchQuery) {
      return this.showAllManagers ? this.uniqueManagers : this.uniqueManagers.slice(0, 4);
    }
    const filtered = this.uniqueManagers.filter(manager =>
      manager.toLowerCase().includes(this.managerSearchQuery.toLowerCase())
    );
    return this.showAllManagers ? filtered : filtered.slice(0, 4);
  }

  get displayedManagerCount(): number {
    return this.filteredManagers.length;
  }

  get totalManagerCount(): number {
    if (!this.managerSearchQuery) {
      return this.uniqueManagers.length;
    }
    return this.uniqueManagers.filter(manager =>
      manager.toLowerCase().includes(this.managerSearchQuery.toLowerCase())
    ).length;
  }

  getActiveFilterCount(): number {
    return this.selectedStatuses.length +
           this.selectedDeliveryUnits.length +
           this.selectedManagers.length;
  }

  // Filter methods
  isStatusSelected(status: string): boolean {
    return this.selectedStatuses.includes(status);
  }

  isDeliveryUnitSelected(deliveryUnit: string): boolean {
    return this.selectedDeliveryUnits.includes(deliveryUnit);
  }

  isManagerSelected(manager: string): boolean {
    return this.selectedManagers.includes(manager);
  }

  toggleStatusFilter(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(status);
    }
    this.emitFiltersChanged();
  }

  toggleDeliveryUnitFilter(deliveryUnit: string): void {
    const index = this.selectedDeliveryUnits.indexOf(deliveryUnit);
    if (index > -1) {
      this.selectedDeliveryUnits.splice(index, 1);
    } else {
      this.selectedDeliveryUnits.push(deliveryUnit);
    }
    this.emitFiltersChanged();
  }

  toggleManagerFilter(manager: string): void {
    const index = this.selectedManagers.indexOf(manager);
    if (index > -1) {
      this.selectedManagers.splice(index, 1);
    } else {
      this.selectedManagers.push(manager);
    }
    this.emitFiltersChanged();
  }

  removeStatusFilter(status: string): void {
    this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    this.emitFiltersChanged();
  }

  removeDeliveryUnitFilter(deliveryUnit: string): void {
    this.selectedDeliveryUnits = this.selectedDeliveryUnits.filter(d => d !== deliveryUnit);
    this.emitFiltersChanged();
  }

  removeManagerFilter(manager: string): void {
    this.selectedManagers = this.selectedManagers.filter(m => m !== manager);
    this.emitFiltersChanged();
  }

  clearAllFilters(): void {
    this.selectedStatuses = [];
    this.selectedDeliveryUnits = [];
    this.selectedManagers = [];
    this.emitFiltersChanged();
  }

  toggleShowAllManagers(): void {
    this.showAllManagers = !this.showAllManagers;
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit({
      selectedStatuses: [...this.selectedStatuses],
      selectedDeliveryUnits: [...this.selectedDeliveryUnits],
      selectedManagers: [...this.selectedManagers]
    });
  }
}