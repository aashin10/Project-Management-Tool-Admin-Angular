import { Component } from '@angular/core';
import { Table } from "../../../shared/table/table";
import { Sectiontitle } from "../../../shared/sectiontitle/sectiontitle";
import { CustomButton } from "../../../shared/custom-button/custom-button";

@Component({
  selector: 'app-deliveryunitslist',
  imports: [Table, Sectiontitle, CustomButton],
  templateUrl: './deliveryunitslist.html',
  styleUrl: './deliveryunitslist.css'
})
export class Deliveryunitslist {
// In your user-management component
columns = [
  { 
    header: 'Delivery Unit Info', 
    field: 'duInfo', 
    type: 'avatar' as const,
    width: '25%'
  },
  { 
    header: 'DU Code', 
    field: 'duCode',
    type: 'text' as const
  },
  { 
    header: 'DU Head', 
    field: 'duHead', 
    type: 'user' as const 
  },
  { 
    header: 'Active Members', 
    field: 'activeMembers',
    type: 'text' as const
  },
  { 
    header: 'Active Projects', 
    field: 'activeProjects',
    type: 'text' as const
  },
  { 
    header: 'Actions', 
    field: 'actions', 
    type: 'actions' as const,
    actions: [
      { label: 'Edit DU', icon: '✏️', action: 'edit' },
      { label: 'Delete DU', icon: '🗑️', action: 'delete', class: 'danger' }
    ]
  }
];
deliveryUnits = [
  {
    duInfo: {
      initials: 'EN',
      name: 'Engineering',
      subtitle: 'Software Development & Architecture'
    },
    duCode: 'ENG-001',
    duHead: {
      avatar: 'SC',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com'
    },
    activeMembers: '24 members',
    activeProjects: '8 projects'
  },
  {
    duInfo: {
      initials: 'PR',
      name: 'Product Management',
      subtitle: 'Product Strategy & Planning'
    },
    duCode: 'PM-002',
    duHead: {
      avatar: 'MR',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@company.com'
    },
    activeMembers: '12 members',
    activeProjects: '5 projects'
  },
  {
    duInfo: {
      initials: 'DE',
      name: 'Design',
      subtitle: 'UX/UI Design & Research'
    },
    duCode: 'DES-003',
    duHead: {
      avatar: 'ET',
      name: 'Emma Thompson',
      email: 'emma.thompson@company.com'
    },
    activeMembers: '8 members',
    activeProjects: '6 projects'
  },
  // Add more DUs...
];
onActionClick(event: {action: string, row: any}) {
  switch(event.action) {
    case 'edit':
      this.editDeliveryUnit(event.row);
      break;
    case 'delete':
      this.deleteDeliveryUnit(event.row);
      break;
  }
}

editDeliveryUnit(du: any) {
  console.log('Edit DU:', du);
  // Navigate to edit page or open modal
}

deleteDeliveryUnit(du: any) {
  console.log('Delete DU:', du);
  // Show confirmation dialog
}
}
