import { Component } from '@angular/core';
import { Table } from "../../../shared/table/table";

@Component({
  selector: 'app-deliveryunitslist',
  imports: [Table],
  templateUrl: './deliveryunitslist.html',
  styleUrl: './deliveryunitslist.css'
})
export class Deliveryunitslist {
// In your user-management component
columns = [
  { header: 'User', field: 'user', type: 'user' as const },
  { header: 'Type', field: 'type', type: 'badge' as const },
  { header: 'Status', field: 'status', type: 'badge' as const },
  { header: 'Created', field: 'created' },
  { header: 'Last Activity', field: 'lastActivity' },
  { header: 'Actions', field: 'actions', type: 'actions' as const }
];

users = [
  {
    user: { avatar: 'JA', name: 'John Admin', email: 'john.admin@company.com' },
    type: 'internal',
    status: 'active',
    created: '2024-01-01',
    lastActivity: '2025-01-20'
  }
];
}
