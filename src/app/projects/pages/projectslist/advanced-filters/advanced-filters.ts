import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  status: 'Ongoing' | 'On Hold' | 'Completed' | 'Planning' | 'Archived';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
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
export class AdvancedFilters {
  @Input() showFilters = false;
  @Input() projects: Project[] = [];
  @Input() statusOptions: string[] = [];
  @Input() priorityOptions: string[] = [];

  @Output() filtersChanged = new EventEmitter<{
    selectedStatuses: string[];
    selectedPriorities: string[];
    selectedManagers: string[];
  }>();

  // Filter state
  selectedStatuses: string[] = [];
  selectedPriorities: string[] = [];
  selectedManagers: string[] = [];

  // Manager search
  managerSearchQuery = '';
  showAllManagers = false;

  // Getters
  get hasActiveFilters(): boolean {
    return this.selectedStatuses.length > 0 ||
           this.selectedPriorities.length > 0 ||
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
           this.selectedPriorities.length +
           this.selectedManagers.length;
  }

  // Filter methods
  isStatusSelected(status: string): boolean {
    return this.selectedStatuses.includes(status);
  }

  isPrioritySelected(priority: string): boolean {
    return this.selectedPriorities.includes(priority);
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

  togglePriorityFilter(priority: string): void {
    const index = this.selectedPriorities.indexOf(priority);
    if (index > -1) {
      this.selectedPriorities.splice(index, 1);
    } else {
      this.selectedPriorities.push(priority);
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

  removePriorityFilter(priority: string): void {
    this.selectedPriorities = this.selectedPriorities.filter(p => p !== priority);
    this.emitFiltersChanged();
  }

  removeManagerFilter(manager: string): void {
    this.selectedManagers = this.selectedManagers.filter(m => m !== manager);
    this.emitFiltersChanged();
  }

  clearAllFilters(): void {
    this.selectedStatuses = [];
    this.selectedPriorities = [];
    this.selectedManagers = [];
    this.emitFiltersChanged();
  }

  toggleShowAllManagers(): void {
    this.showAllManagers = !this.showAllManagers;
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit({
      selectedStatuses: [...this.selectedStatuses],
      selectedPriorities: [...this.selectedPriorities],
      selectedManagers: [...this.selectedManagers]
    });
  }
}
