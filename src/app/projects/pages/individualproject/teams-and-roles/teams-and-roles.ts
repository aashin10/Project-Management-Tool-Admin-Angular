import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableColumn } from '../../../../shared/table/table';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { AddMemberModal } from './add-member-modal/add-member-modal';

interface TeamMember {
  id: string;
  name: string;
  department: string;
  status?: string;
  role: string;
  email: string;
}

@Component({
  selector: 'app-teams-and-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, CustomButton, AddMemberModal],
  templateUrl: './teams-and-roles.html',
  styleUrls: ['./teams-and-roles.css']
})
export class TeamsAndRoles {
  searchQuery: string = '';
  selectedRole: string = 'all';
  
  roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Tech Lead', label: 'Tech Lead' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Senior Developer', label: 'Senior Developer' },
    { value: 'QA Engineer', label: 'QA Engineer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Business Analyst', label: 'Business Analyst' }
  ];

  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Asha Varma',
      department: 'Engineering',
      role: 'Project Manager',
      email: 'asha.varma@company.com',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Pranav Iyer',
      department: 'Engineering',
      role: 'Tech Lead',
      email: 'pranav.iyer@company.com',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Sarah Chen',
      department: 'Design',
      role: 'UI/UX Designer',
      email: 'sarah.chen@company.com',
      status: 'Inactive'
    },
    {
      id: '4',
      name: 'Mike Johnson',
      department: 'Engineering',
      role: 'Senior Developer',
      email: 'mike.johnson@company.com',
      status: 'Active'
    },
    {
      id: '5',
      name: 'Lisa Wong',
      department: 'Quality Assurance',
      role: 'QA Engineer',
      email: 'lisa.wong@company.com',
      status: 'Active'
    },
    {
      id: '6',
      name: 'David Kumar',
      department: 'Engineering',
      role: 'DevOps Engineer',
      email: 'david.kumar@company.com',
      status: 'Active'
    },
    {
      id: '7',
      name: 'Emma Thompson',
      department: 'Business',
      role: 'Business Analyst',
      email: 'emma.thompson@company.com',
      status: 'Inactive'
    },
    {
      id: '8',
      name: 'James Wilson',
      department: 'Engineering',
      role: 'Senior Developer',
      email: 'james.wilson@company.com',
      status: 'Suspended'
    },
    {
      id: '9',
      name: 'Olivia Martinez',
      department: 'Design',
      role: 'UI/UX Designer',
      email: 'olivia.martinez@company.com',
      status: 'Inactive'
    },
    {
      id: '10',
      name: 'Ethan Brown',
      department: 'Quality Assurance',
      role: 'QA Engineer',
      email: 'ethan.brown@company.com',
      status: 'Active'
    },
    {
      id: '11',
      name: 'Sophia Davis',
      department: 'Business',
      role: 'Business Analyst',
      email: 'sophia.davis@company.com',
      status: 'Inactive'
    },
    {
      id: '12',
      name: 'Liam Smith',
      department: 'Engineering',
      role: 'Senior Developer',
      email: 'liam.smith@company.com',
      status: 'Active'
    }
  ];

  tableColumns: TableColumn[] = [
    {
      header: 'Member Info',
      field: 'member',
      type: 'user',
      sortable: true,
      width: '25%'
    },
    {
      header: 'Role',
      field: 'role',
      type: 'badge',
      sortable: true,
      width: '15%',
      badgeColors: {
        'Project Manager': 'bg-purple-100 text-purple-800',
        'Tech Lead': 'bg-blue-100 text-blue-800',
        'UI/UX Designer': 'bg-pink-100 text-pink-800',
        'Senior Developer': 'bg-green-100 text-green-800',
        'QA Engineer': 'bg-orange-100 text-orange-800',
        'DevOps Engineer': 'bg-indigo-100 text-indigo-800',
        'Business Analyst': 'bg-yellow-100 text-yellow-800'
      }
    },
    {
      header: 'Email',
      field: 'email',
      type: 'text',
      sortable: false,
      width: '25%'
    },
    {
      header: 'Status',
      field: 'status',
      type: 'badge',
      sortable: false,
      width: '25%',
      badgeColors: {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Suspended': 'bg-red-100 text-red-800',
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: '10%',
      actions: [
        { label: 'Remove from Project', icon: '🗑️', action: 'remove', class: 'danger' }
      ]
    }
  ];

  get filteredMembers(): TeamMember[] {
    let filtered = [...this.teamMembers];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        (member.status && member.status.toLowerCase().startsWith(query))
      );
    }

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === this.selectedRole);
    }

    return filtered;
  }

  get tableData(): any[] {
    return this.filteredMembers.map(member => ({
      member: {
        name: member.name,
        avatar: member.name.slice(0,2).toUpperCase(),
      },
      role: member.role,
      email: member.email,
      status: member.status,
      actions: member.id
    }));
  }

  get selectedCount(): number {
    return 0; // Will be handled by table component
  }

  onSearchChange(): void {
    // Search happens automatically through getter
  }

  onRoleFilterChange(): void {
    // Filter happens automatically through getter
  }

  handleTableAction(event: { action: string; row: any }): void {
    const member = this.teamMembers.find(m => m.id === event.row.actions);
    
    if (event.action) {
      if (event.action === 'remove') {
        this.removeMember(member);
      }
    }
  }


  removeSelected(): void {
    console.log('Remove selected members');
    // Show confirmation and remove
  }



  private removeMember(member: TeamMember | undefined): void {
    if (member && confirm(`Are you sure you want to remove ${member.name} from this project?`)) {
      this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
      console.log('Removed member:', member.name);
    }
  }
  showAddModal: boolean = false;
  addMember(): void {
  this.showAddModal = true;
}

handleMemberAdded(newMember: any): void {
  const newId = (this.teamMembers.length + 1).toString();
  this.teamMembers.push({
    id: newId,
    name: newMember.name,
    department: newMember.department,
    role: newMember.role,
    email: newMember.email,
    status: newMember.status || 'Active'
  });
  this.showAddModal = false;
}

}

