import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from "../../../shared/table/table";
import { Sectiontitle } from "../../../shared/sectiontitle/sectiontitle";
import { CustomButton } from "../../../shared/custom-button/custom-button";
import { SearchBar } from "../../../shared/components/search-bar/search-bar";
import { CommonModule } from '@angular/common';
import { Modal } from "../../../shared/modal/modal";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deliveryunitslist',
  standalone: true,
  imports: [Table, Sectiontitle, CustomButton, SearchBar, CommonModule, Modal, FormsModule],
  templateUrl: './deliveryunitslist.html',
  styleUrl: './deliveryunitslist.css'
})
export class Deliveryunitslist {
  searchQuery: string = '';
  filteredDeliveryUnits: any[] = [];
  isModalOpen: boolean = false;

  // Form data model
  newDU = {
    name: '',
    code: '',
    description: '',
    headName: '',
    headEmail: ''
  };

  // Available colors for DU avatars
  private duColors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500'];

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
      type: 'text' as const,
      align: 'left' as const
    },
    { 
      header: 'DU Head', 
      field: 'duHead', 
      type: 'user' as const
    },
    { 
      header: 'Active Members', 
      field: 'activeMembers',
      type: 'text' as const,
      align: 'left' as const,
      icon: 'assets/user.svg',
      iconPosition: 'left' as const
    },
    { 
      header: 'Active Projects', 
      field: 'activeProjects',
      type: 'text' as const,
      align: 'left' as const,
      icon: 'assets/icons/projects-icon.svg',
      iconPosition: 'left' as const
    },
    { 
      header: 'Actions', 
      field: 'actions', 
      type: 'actions' as const,
      actions: [
        { label: 'Edit DU', icon: 'assets/edit.svg', action: 'edit' },
        { label: 'View Details', icon: 'assets/eye.svg', action: 'view' },
        { label: 'Delete DU', icon: 'assets/trash.svg', action: 'delete', class: 'danger' }
      ]
    }
  ];

  deliveryUnits = [
    {
      duInfo: {
        initials: 'EN',
        name: 'Engineering',
        subtitle: 'Software Development & Architecture',
        bgColor: 'bg-blue-500'
      },
      duCode: 'ENG-001',
      duHead: {
        avatar: 'SC',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        bgColor: 'bg-gray-200'
      },
      activeMembers: '24',
      activeProjects: '8'
    },
    {
      duInfo: {
        initials: 'PR',
        name: 'Product Management',
        subtitle: 'Product Strategy & Planning',
        bgColor: 'bg-purple-500'
      },
      duCode: 'PM-002',
      duHead: {
        avatar: 'MR',
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@company.com',
        bgColor: 'bg-gray-200'
      },
      activeMembers: '12',
      activeProjects: '5'
    },
    {
      duInfo: {
        initials: 'DE',
        name: 'Design',
        subtitle: 'UX/UI Design & Research',
        bgColor: 'bg-blue-500'
      },
      duCode: 'DES-003',
      duHead: {
        avatar: 'ET',
        name: 'Emma Thompson',
        email: 'emma.thompson@company.com',
        bgColor: 'bg-gray-200'
      },
      activeMembers: '8',
      activeProjects: '6'
    },
    {
      duInfo: {
        initials: 'MA',
        name: 'Marketing',
        subtitle: 'Digital Marketing & Growth',
        bgColor: 'bg-orange-500'
      },
      duCode: 'MKT-004',
      duHead: {
        avatar: 'JW',
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        bgColor: 'bg-gray-200'
      },
      activeMembers: '15',
      activeProjects: '4'
    },
    {
      duInfo: {
        initials: 'SE',
        name: 'Security',
        subtitle: 'Information Security & Compliance',
        bgColor: 'bg-teal-500'
      },
      duCode: 'SEC-005',
      duHead: {
        avatar: 'LA',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        bgColor: 'bg-gray-200'
      },
      activeMembers: '6',
      activeProjects: '3'
    }
  ];

  constructor(private router: Router) {
    this.filteredDeliveryUnits = [...this.deliveryUnits];
  }

  onAddNewDU(): void {
    this.isModalOpen = true;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newDU = {
      name: '',
      code: '',
      description: '',
      headName: '',
      headEmail: ''
    };
  }

  generateDUCode(name: string): string {
    if (!name || !name.trim()) {
      return '';
    }

    // Split the name into words and filter out empty strings
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);
    
    let prefix = '';
    
    if (words.length === 1) {
      // Single word: take first 2-3 characters
      const word = words[0];
      prefix = word.length <= 2 ? word.toUpperCase() : word.substring(0, 3).toUpperCase();
    } else {
      // Multiple words: take first letter of each word (up to 4 letters)
      prefix = words
        .slice(0, 4)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }

    // Generate a unique number by finding the next available number
    let number = 1;
    
    // Find the highest existing number for this prefix
    const existingCodes = this.deliveryUnits
      .map(du => du.duCode)
      .filter(duCode => duCode.startsWith(prefix + '-'));
    
    if (existingCodes.length > 0) {
      const numbers = existingCodes.map(code => {
        const parts = code.split('-');
        return parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
      });
      number = Math.max(...numbers) + 1;
    }

    const code = `${prefix}-${number.toString().padStart(3, '0')}`;
    
    return code;
  }

 onDUNameChange() {
  if (this.newDU.name) {
    const prefix = this.newDU.name.trim().split(' ')[0].substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
    this.newDU.code = `${prefix}-${randomNum}`;
  } else {
    this.newDU.code = '';
  }
}

  getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRandomColor(): string {
    return this.duColors[Math.floor(Math.random() * this.duColors.length)];
  }

  validateForm(): boolean {
    if (!this.newDU.name.trim()) {
      alert('Please enter a DU name');
      return false;
    }
    if (!this.newDU.code.trim()) {
      alert('Please enter a DU code');
      return false;
    }
    // Validate DU code format
    const codePattern = /^[A-Z]{2,4}-\d{3}$/;
    if (!codePattern.test(this.newDU.code.toUpperCase())) {
      alert('DU Code must be in format: 2-4 letters, dash, 3 digits (e.g., ENG-001)');
      return false;
    }
    // Check for duplicate code
    if (this.deliveryUnits.some(du => du.duCode === this.newDU.code.toUpperCase())) {
      alert('This DU code already exists. Please use a unique code.');
      return false;
    }
    if (!this.newDU.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    if (!this.newDU.headName.trim()) {
      alert('Please enter the head name');
      return false;
    }
    if (!this.newDU.headEmail.trim()) {
      alert('Please enter the head email');
      return false;
    }
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.newDU.headEmail)) {
      alert('Please enter a valid email address');
      return false;
    }
    return true;
  }

  onCreateDeliveryUnit(event: Event): void {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const newDeliveryUnit = {
      duInfo: {
        initials: this.getInitials(this.newDU.name),
        name: this.newDU.name,
        subtitle: this.newDU.description,
        bgColor: this.getRandomColor()
      },
      duCode: this.newDU.code.toUpperCase(),
      duHead: {
        avatar: this.getInitials(this.newDU.headName),
        name: this.newDU.headName,
        email: this.newDU.headEmail,
        bgColor: 'bg-gray-200'
      },
      activeMembers: '0',
      activeProjects: '0'
    };

    // Add to the beginning of the array for visibility
    this.deliveryUnits.unshift(newDeliveryUnit);
    this.filteredDeliveryUnits = [...this.deliveryUnits];

    // Show success message
    console.log('Delivery Unit created successfully:', newDeliveryUnit);
    
    // Close modal and reset form
    this.onCloseModal();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query.toLowerCase();
    
    if (!this.searchQuery) {
      this.filteredDeliveryUnits = [...this.deliveryUnits];
      return;
    }

    this.filteredDeliveryUnits = this.deliveryUnits.filter(du => {
      return (
        du.duInfo.name.toLowerCase().includes(this.searchQuery) ||
        du.duInfo.subtitle.toLowerCase().includes(this.searchQuery) ||
        du.duCode.toLowerCase().includes(this.searchQuery) ||
        du.duHead.name.toLowerCase().includes(this.searchQuery) ||
        du.duHead.email.toLowerCase().includes(this.searchQuery)
      );
    });
  }

  onActionClick(event: {action: string, row: any}): void {
    switch(event.action) {
      case 'edit':
        this.editDeliveryUnit(event.row);
        break;
      case 'view':
        this.viewDeliveryUnit(event.row);
        break;
      case 'delete':
        this.deleteDeliveryUnit(event.row);
        break;
    }
  }

  editDeliveryUnit(du: any): void {
    console.log('Edit DU:', du);
    this.router.navigate(['/delivery-units/edit', du.duCode]);
  }

  viewDeliveryUnit(du: any): void {
    console.log('View DU:', du);
    this.router.navigate(['/delivery-units/view', du.duCode]);
  }

  deleteDeliveryUnit(du: any): void {
    console.log('Delete DU:', du);
    const confirmed = confirm(`Are you sure you want to delete ${du.duInfo.name}?`);
    if (confirmed) {
      this.deliveryUnits = this.deliveryUnits.filter(unit => unit.duCode !== du.duCode);
      this.filteredDeliveryUnits = this.filteredDeliveryUnits.filter(unit => unit.duCode !== du.duCode);
    }
  }
}