import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryUnitsService } from '../../../../shared/services/delivery-units.service';

@Component({
  selector: 'app-team-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teaminfo.html',
  styleUrl: './teaminfo.css'
})
export class TeamOrganizationComponent {
  @Input() manager: string = '';
  @Input() deliveryUnit: string = '';

  @Output() managerChange = new EventEmitter<string>();
  @Output() deliveryUnitChange = new EventEmitter<string>();

  constructor(private deliveryUnitsService: DeliveryUnitsService) {}

  get deliveryUnits() {
    return this.deliveryUnitsService.getDeliveryUnits();
  }

  // Autocomplete data + state
  users = [
    { user: 'Alice Johnson', email: 'alice.johnson@company.com' },
    { user: 'Bob Smith', email: 'bob.smith@external.com' },
    { user: 'Charlie Brown', email: 'charlie.brown@customer.com' },
    { user: 'David Miller', email: 'david.miller@company.com' },
    { user: 'Eva Williams', email: 'eva.williams@external.com' },
    { user: 'Frank Harris', email: 'frank.harris@customer.com' },
    { user: 'Grace Taylor', email: 'grace.taylor@company.com' },
    { user: 'Henry White', email: 'henry.white@external.com' },
    { user: 'Ivy Martin', email: 'ivy.martin@customer.com' },
    { user: 'Jack Thompson', email: 'jack.thompson@company.com' },
    { user: 'Karen Anderson', email: 'karen.anderson@external.com' },
    { user: 'Leo Martinez', email: 'leo.martinez@customer.com' },
    { user: 'Mia Robinson', email: 'mia.robinson@company.com' },
    { user: 'Nathan Clark', email: 'nathan.clark@external.com' },
    { user: 'Olivia Lewis', email: 'olivia.lewis@customer.com' },
    { user: 'Paul Walker', email: 'paul.walker@company.com' },
    { user: 'Quinn Hall', email: 'quinn.hall@external.com' },
    { user: 'Rachel Allen', email: 'rachel.allen@customer.com' },
    { user: 'Samuel Young', email: 'samuel.young@company.com' },
    { user: 'Tina King', email: 'tina.king@external.com' },
    { user: 'Uma Scott', email: 'uma.scott@customer.com' },
    { user: 'Victor Green', email: 'victor.green@company.com' },
    { user: 'Wendy Baker', email: 'wendy.baker@external.com' },
    { user: 'Xavier Adams', email: 'xavier.adams@customer.com' },
    { user: 'Yara Nelson', email: 'yara.nelson@company.com' },
    { user: 'Zane Carter', email: 'zane.carter@external.com' },
    { user: 'Aaron Torres', email: 'aaron.torres@customer.com' },
    { user: 'Bella Perez', email: 'bella.perez@company.com' },
    { user: 'Cody Ramirez', email: 'cody.ramirez@external.com' },
    { user: 'Diana Flores', email: 'diana.flores@customer.com' },
    { user: 'Ethan Rivera', email: 'ethan.rivera@company.com' },
    { user: 'Fiona Cooper', email: 'fiona.cooper@external.com' },
    { user: 'George Morgan', email: 'george.morgan@customer.com' },
    { user: 'Hannah Reed', email: 'hannah.reed@company.com' },
    { user: 'Ian Bailey', email: 'ian.bailey@external.com' },
    { user: 'Julia Murphy', email: 'julia.murphy@customer.com' },
    { user: 'Kevin Bell', email: 'kevin.bell@company.com' },
    { user: 'Laura Rivera', email: 'laura.rivera@external.com' },
    { user: 'Mike Foster', email: 'mike.foster@customer.com' },
    { user: 'Nora Gray', email: 'nora.gray@company.com' },
    { user: 'Oscar Price', email: 'oscar.price@external.com' },
    { user: 'Pamela Hughes', email: 'pamela.hughes@customer.com' },
    { user: 'Quincy Bryant', email: 'quincy.bryant@company.com' },
    { user: 'Rita Diaz', email: 'rita.diaz@external.com' },
    { user: 'Steven Myers', email: 'steven.myers@customer.com' },
    { user: 'Teresa Howard', email: 'teresa.howard@company.com' },
    { user: 'Umar Chavez', email: 'umar.chavez@external.com' },
    { user: 'Vanessa Brooks', email: 'vanessa.brooks@customer.com' },
    { user: 'William Sanders', email: 'william.sanders@company.com' },
    { user: 'Ximena Ward', email: 'ximena.ward@external.com' }
  ];

  filteredManagers: Array<{user:string,email:string}> = [];
  showManagerSuggestions = false;

  onManagerInput(value: string) {
    const q = (value || '').trim().toLowerCase();
    if (!q) {
      this.filteredManagers = [];
      this.showManagerSuggestions = false;
      return;
    }
    this.filteredManagers = this.users.filter(u => u.user.toLowerCase().includes(q)).slice(0, 8);
    this.showManagerSuggestions = this.filteredManagers.length > 0;
  }

  selectManager(u: {user:string,email:string}) {
    if (!u || typeof u.user !== 'string') {
      return;
    }
    this.manager = u.user;
    this.managerChange.emit(this.manager);
    this.showManagerSuggestions = false;
  }

  clearManager() {
    this.manager = '';
    this.managerChange.emit(this.manager);
    this.filteredManagers = [];
    this.showManagerSuggestions = false;
  }
}
