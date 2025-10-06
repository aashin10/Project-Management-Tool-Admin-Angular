import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomButton } from '../../../../../shared/custom-button/custom-button';

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  status: string;
}

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton],
  templateUrl: './add-member-modal.html',
  styleUrls: ['./add-member-modal.css']
})
export class AddMemberModal {
  @Output() close = new EventEmitter<void>();
  @Output() memberAdded = new EventEmitter<any>();

  searchQuery: string = '';
  selectedEmployee: Employee | null = null;
  selectedRole: string = '';
  status: string = '';

  // Dummy employee list
  employees: Employee[] = [
    { id: '101', name: 'Amit Sharma', department: 'Engineering', email: 'amit.sharma@company.com', status: 'active' },
    { id: '102', name: 'Riya Das', department: 'Design', email: 'riya.das@company.com', status: 'active' },
    { id: '103', name: 'Kevin Thomas', department: 'Engineering', email: 'kevin.thomas@company.com', status: 'inactive' },
    { id: '104', name: 'Sofia Mehta', department: 'Business', email: 'sofia.mehta@company.com', status: 'active' },
    { id: '105', name: 'John Paul', department: 'Quality Assurance', email: 'john.paul@company.com', status: 'active' },
  ];

  roleOptions = [
    'Project Manager',
    'Tech Lead',
    'UI/UX Designer',
    'Senior Developer',
    'QA Engineer',
    'DevOps Engineer',
    'Business Analyst'
  ];

  get filteredEmployees(): Employee[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.employees.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query)
    );
  }

  selectEmployee(emp: Employee): void {
    this.selectedEmployee = emp;
  }

  addMember(): void {
    if (this.selectedEmployee && this.selectedRole) {
      const newMember = {
        ...this.selectedEmployee,
        role: this.selectedRole,
        status: this.status
      };
      this.memberAdded.emit(newMember);
      this.close.emit();
    } else {
      alert('Please select an employee and role before adding.');
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
