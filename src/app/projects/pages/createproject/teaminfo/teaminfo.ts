import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { UserFilterResponse } from '../../../services/projects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teaminfo.html',
  styleUrl: './teaminfo.css'
})
export class TeamOrganizationComponent implements OnInit, OnChanges {

  // Private properties for two-way binding
  private _manager: string = '';
  private _deliveryUnit: string = '';
  private _selectedProjectManagerId: number = 0;
  private _selectedDeliveryUnitId: number = 0;

  // Two-way binding getters and setters
  @Input()
  get manager(): string {
    return this._manager;
  }
  set manager(value: string) {
    this._manager = value || '';
    this.managerChange.emit(this._manager);
  }

  @Input()
  get deliveryUnit(): string {
    return this._deliveryUnit;
  }
  set deliveryUnit(value: string) {
    this._deliveryUnit = value || '';
    this.deliveryUnitChange.emit(this._deliveryUnit);
  }

  @Input() deliveryUnits: any[] = [];

  @Input() 
  get selectedProjectManagerId(): number {
    return this._selectedProjectManagerId;
  }
  set selectedProjectManagerId(value: number) {
    this._selectedProjectManagerId = value || 0;
    this.selectedProjectManagerIdChange.emit(this._selectedProjectManagerId);
  }

  @Input()
  get selectedDeliveryUnitId(): number {
    return this._selectedDeliveryUnitId;
  }
  set selectedDeliveryUnitId(value: number) {
    this._selectedDeliveryUnitId = value || 0;
    this.selectedDeliveryUnitIdChange.emit(this._selectedDeliveryUnitId);
  }

  private _filteredUsers: UserFilterResponse[] = [];
  @Input() set filteredUsers(val: UserFilterResponse[] | null | undefined) {
    this._filteredUsers = val ?? [];
  }
  get filteredUsers(): UserFilterResponse[] {
    return this._filteredUsers;
  }

  @Output() managerChange = new EventEmitter<string>();
  @Output() deliveryUnitChange = new EventEmitter<string>();
  @Output() selectedProjectManagerIdChange = new EventEmitter<number>();
  @Output() selectedDeliveryUnitIdChange = new EventEmitter<number>();
  @Output() managerSearch = new EventEmitter<string>();
  @Output() managerSelect = new EventEmitter<UserFilterResponse>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update private properties directly without triggering change events during initialization
    if (changes['manager'] && changes['manager'].currentValue !== undefined) {
      this._manager = changes['manager'].currentValue || '';
    }
    
    if (changes['deliveryUnit'] && changes['deliveryUnit'].currentValue !== undefined) {
      this._deliveryUnit = changes['deliveryUnit'].currentValue || '';
    }
    
    if (changes['deliveryUnits'] && changes['deliveryUnits'].currentValue !== undefined) {
      this.deliveryUnits = changes['deliveryUnits'].currentValue || [];
    }
    
    if (changes['selectedProjectManagerId'] && changes['selectedProjectManagerId'].currentValue !== undefined) {
      this._selectedProjectManagerId = changes['selectedProjectManagerId'].currentValue || 0;
    }
    
    if (changes['selectedDeliveryUnitId'] && changes['selectedDeliveryUnitId'].currentValue !== undefined) {
      this._selectedDeliveryUnitId = changes['selectedDeliveryUnitId'].currentValue || 0;
    }
    
    // Force change detection to update template
    this.cdr.detectChanges();
  }


  showManagerSuggestions = false;

  onManagerInput(value: string) {
    this.managerSearch.emit(value);
    // Always show dropdown when typing or when we have users loaded
    this.showManagerSuggestions = true;
  }

  onManagerFocus() {
    // Show dropdown when field is focused, even if empty
    this.showManagerSuggestions = true;
    // Trigger search to load all users if not already loaded
    if (this.filteredUsers.length === 0) {
      this.managerSearch.emit('');
    }
  }

  selectManager(u: UserFilterResponse) {
    if (!u || typeof u.name !== 'string') {
      return;
    }
    this._manager = u.name;
    this._selectedProjectManagerId = u.id;
    this.managerChange.emit(this._manager);
    this.selectedProjectManagerIdChange.emit(this._selectedProjectManagerId);
    this.managerSelect.emit(u); // Emit the full user object
    this.showManagerSuggestions = false;
  }

  clearManager() {
    this._manager = '';
    this._selectedProjectManagerId = 0;
    this.managerChange.emit(this._manager);
    this.selectedProjectManagerIdChange.emit(this._selectedProjectManagerId);
    this.showManagerSuggestions = false;
  }

  onDeliveryUnitChange(code: string) {
    this._deliveryUnit = code;
    // Find the delivery unit by code and emit the ID
    const selectedDu = this.deliveryUnits.find(du => du.code === code);
    if (selectedDu) {
      this._selectedDeliveryUnitId = selectedDu.id;
      this.selectedDeliveryUnitIdChange.emit(this._selectedDeliveryUnitId);
    }
    this.deliveryUnitChange.emit(code);
  }
}
