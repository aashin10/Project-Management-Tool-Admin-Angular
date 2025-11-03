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

  @Input() manager: string = '';
  @Input() deliveryUnit: string = '';
  @Input() deliveryUnits: any[] = [];
  private _filteredUsers: UserFilterResponse[] = [];
  @Input() set filteredUsers(val: UserFilterResponse[] | null | undefined) {
    this._filteredUsers = val ?? [];
  }
  get filteredUsers(): UserFilterResponse[] {
    return this._filteredUsers;
  }

  @Output() managerChange = new EventEmitter<string>();
  @Output() deliveryUnitChange = new EventEmitter<string>();
  @Output() managerSearch = new EventEmitter<string>();
  @Output() managerSelect = new EventEmitter<UserFilterResponse>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('TeamOrganizationComponent - ngOnInit - Received deliveryUnits:', this.deliveryUnits);
    console.log('TeamOrganizationComponent - ngOnInit - Current deliveryUnit:', this.deliveryUnit);
    console.log('TeamOrganizationComponent - ngOnInit - Current manager:', this.manager);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('TeamOrganizationComponent - ngOnChanges triggered:', changes);
    
    if (changes['manager']) {
      console.log('Manager changed from', changes['manager'].previousValue, 'to', changes['manager'].currentValue);
      this.manager = changes['manager'].currentValue || '';
    }
    
    if (changes['deliveryUnit']) {
      console.log('Delivery Unit changed from', changes['deliveryUnit'].previousValue, 'to', changes['deliveryUnit'].currentValue);
      this.deliveryUnit = changes['deliveryUnit'].currentValue || '';
    }
    
    if (changes['deliveryUnits']) {
      console.log('Delivery Units array changed:', changes['deliveryUnits'].currentValue);
      this.deliveryUnits = changes['deliveryUnits'].currentValue || [];
    }
    
    // Force change detection
    this.cdr.detectChanges();
  }


  showManagerSuggestions = false;

  onManagerInput(value: string) {
    this.managerSearch.emit(value);
    // Show suggestions for 1+ characters if there are results
    this.showManagerSuggestions = !!value && value.length > 0 && this.filteredUsers.length > 0;
  }

  selectManager(u: UserFilterResponse) {
    if (!u || typeof u.name !== 'string') {
      return;
    }
    this.manager = u.name;
    this.managerChange.emit(this.manager);
    this.managerSelect.emit(u); // Emit the full user object
    this.showManagerSuggestions = false;
  }

  clearManager() {
    this.manager = '';
    this.managerChange.emit(this.manager);
    this.showManagerSuggestions = false;
  }
}
