import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableColumn } from '../../../../shared/table/table';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

interface TeamMember {
  id: string;
  name: string;
  department: string;
  initials: string;
  avatarColor: string;
  role: string;
  email: string;
  issuesCount: number;
}

@Component({
  selector: 'app-teams-and-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, CustomButton],
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
      initials: 'AV',
      avatarColor: '#E9D5FF',
      role: 'Project Manager',
      email: 'asha.varma@company.com',
      issuesCount: 8,
    },
    {
      id: '2',
      name: 'Pranav Iyer',
      department: 'Engineering',
      initials: 'PI',
      avatarColor: '#BFDBFE',
      role: 'Tech Lead',
      email: 'pranav.iyer@company.com',
      issuesCount: 12,
    },
    {
      id: '3',
      name: 'Sarah Chen',
      department: 'Design',
      initials: 'SC',
      avatarColor: '#FBCFE8',
      role: 'UI/UX Designer',
      email: 'sarah.chen@company.com',
      issuesCount: 6,
    },
    {
      id: '4',
      name: 'Mike Johnson',
      department: 'Engineering',
      initials: 'MJ',
      avatarColor: '#BBF7D0',
      role: 'Senior Developer',
      email: 'mike.johnson@company.com',
      issuesCount: 10,
    },
    {
      id: '5',
      name: 'Lisa Wong',
      department: 'Quality Assurance',
      initials: 'LW',
      avatarColor: '#FED7AA',
      role: 'QA Engineer',
      email: 'lisa.wong@company.com',
      issuesCount: 7,
    },
    {
      id: '6',
      name: 'David Kumar',
      department: 'Engineering',
      initials: 'DK',
      avatarColor: '#DDD6FE',
      role: 'DevOps Engineer',
      email: 'david.kumar@company.com',
      issuesCount: 5,
    },
    {
      id: '7',
      name: 'Emma Thompson',
      department: 'Business',
      initials: 'ET',
      avatarColor: '#FEF08A',
      role: 'Business Analyst',
      email: 'emma.thompson@company.com',
      issuesCount: 4,
    },
    {
      id: '8',
      name: 'James Wilson',
      department: 'Engineering',
      initials: 'JW',
      avatarColor: '#A5F3FC',
      role: 'Senior Developer',
      email: 'james.wilson@company.com',
      issuesCount: 9,
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
      header: 'Contact',
      field: 'email',
      type: 'text',
      sortable: false,
      width: '25%'
    },
    {
      header: 'Assigned Issues',
      field: 'issues',
      type: 'text',
      sortable: true,
      width: '15%'
    },
    {
      header: 'Actions',
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: '10%',
      actions: [
        { label: 'Change Role', icon: '🔄', action: 'change-role' },
        { label: 'View Profile', icon: '👤', action: 'view-profile' },
        { label: 'Send Message', icon: '✉️', action: 'send-message' },
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
        member.department.toLowerCase().includes(query)
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
        email: member.department,
        avatar: member.initials,
        color: member.avatarColor
      },
      role: member.role,
      email: member.email,
      issues: `${member.issuesCount} issues`,
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
    
    switch (event.action) {
      case 'change-role':
        this.changeRole(member);
        break;
      case 'view-profile':
        this.viewProfile(member);
        break;
      case 'send-message':
        this.sendMessage(member);
        break;
      case 'remove':
        this.removeMember(member);
        break;
    }
  }

  addMember(): void {
    console.log('Add new member');
    // Open modal or navigate to add member page
  }

  changeRoleSelected(): void {
    console.log('Change role for selected members');
    // Open role change modal
  }

  removeSelected(): void {
    console.log('Remove selected members');
    // Show confirmation and remove
  }

  private changeRole(member: TeamMember | undefined): void {
    if (member) {
      console.log('Change role for:', member.name);
      // Open role selection modal
    }
  }

  private viewProfile(member: TeamMember | undefined): void {
    if (member) {
      console.log('View profile for:', member.name);
      // Navigate to member profile
    }
  }

  private sendMessage(member: TeamMember | undefined): void {
    if (member) {
      console.log('Send message to:', member.name);
      // Open messaging interface
    }
  }

  private removeMember(member: TeamMember | undefined): void {
    if (member && confirm(`Are you sure you want to remove ${member.name} from this project?`)) {
      this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
      console.log('Removed member:', member.name);
    }
  }
}