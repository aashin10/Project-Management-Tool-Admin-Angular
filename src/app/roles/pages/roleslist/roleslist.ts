import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RolesService } from '../../services/roles.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Table, TableColumn } from '../../../shared/table/table';
import { Modal } from '../../../shared/modal/modal';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';
 
interface RoleInfo {
  icon: string;
  name: string;
}
 
interface Role {
  id: string;
  roleInfo: RoleInfo;
  description: string;
  users: number;
  created: string;
  cloneFrom?: string;
  permissionIds?: number[];
  isDefault?: boolean; // Flag for default roles
}
 
@Component({
  selector: 'app-roleslist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sectiontitle,
    SearchBar,
    Table,
    Modal,
    CustomButton,
    LoadingIndicator
  ],
  templateUrl: './roleslist.html',
  styleUrls: ['./roleslist.css']
})
export class Roleslist implements OnInit {
  isModalOpen = false;
  showDeleteModal = false;
  roleToDelete: Role | null = null;
  deleteIndex: number = -1;
  // Track currently edited role id and original permissions for debugging
  roleId: string | null = null;
  originalPermissions: number[] = [];
  constructor(private toastr: ToastrService, private rolesService: RolesService, private cdr: ChangeDetectorRef) {}
  isEditMode = false;
  editingIndex: number = -1;
  
  // Tooltip properties for roles
  hoveredRole: Role | null = null;
  tooltipPosition = { x: 0, y: 0 };
  private tooltipTimeout: any;

  // Tooltip properties for actions
  actionTooltip: string = '';
  actionTooltipPosition = { x: 0, y: 0 };
 
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  isLoading = false;
  
  ngOnInit(): void {
    this.loadData();
  }
  
  private loadData(): void {
    this.isLoading = true;
    this.fetchRoles();
    this.fetchPermissions();
  }

  fetchRoles(): void {
    this.rolesService.fetchRoles().subscribe({
      next: (apiRoles) => {
        console.log('Raw API roles response:', apiRoles);
        this.roles = apiRoles.map((r, index) => {
          const mappedRole = {
            id: r.id,
            roleInfo: { icon: 'shield', name: r.name },
            description: r.description ?? '',
            users: r.userCount ?? 0,
            created: r.createdAt ? r.createdAt.split('T')[0] : '',
            permissionIds: Array.isArray(r.permissions)
              ? r.permissions.map((p: any) => typeof p === 'object' && p.id ? p.id : Number(p))
              : [],
            // Mark first two roles (Admin and Project Manager) as default/non-editable
            isDefault: index < 2
          };
          console.log(`Mapped role ${r.name}:`, mappedRole);
          return mappedRole;
        });
        this.filteredRoles = [...this.roles];
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection on error
        this.toastr.error('Failed to fetch roles from server', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }
 
  columns: TableColumn[] = [
    { header: 'Role Name', field: 'roleInfo', type: 'roleIcon', width: '25%' },
    { header: 'Description', field: 'description', type: 'text', width: '35%' },
    { 
      header: 'Users', 
      field: 'users', 
      type: 'text',
      width: '10%',
      icon: 'images/team-size.svg',
      align: 'left' as const
    },
    { header: 'Created', field: 'created', type: 'text', width: '15%' },
    {
      header: 'Actions',
      field: 'actions',
      type: 'text', // Changed to text to hide the 3-dot menu
      width: '15%'
    }
  ];
 
  newRole: Partial<Role> = {
    roleInfo: { icon: 'shield', name: '' },
    description: '',
    users: 0,
    created: '',
    cloneFrom: '',
    permissionIds: []
  };
 
  permissionsList: Array<{ id: number; name: string; description?: string }> = [];

  fetchPermissions(): void {
    this.rolesService.fetchPermissions().subscribe({
      next: (permissions: any) => {
        // If API returns { data: Permission[] } or similar, extract array
        if (Array.isArray(permissions)) {
          this.permissionsList = permissions;
        } else if (permissions && Array.isArray(permissions.data)) {
          this.permissionsList = permissions.data;
        } else {
          this.permissionsList = [];
        }
        this.cdr.detectChanges(); // Force change detection
      },
      error: () => {
        this.cdr.detectChanges(); // Force change detection on error
        this.toastr.error('Failed to fetch permissions from server', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  // Show role tooltip with delay
  showRoleTooltip(event: MouseEvent, role: Role) {
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => {
      this.hoveredRole = role;
      this.updateTooltipPosition(event);
    }, 300); // 300ms delay before showing
  }

  // Hide role tooltip
  hideRoleTooltip() {
    clearTimeout(this.tooltipTimeout);
    this.hoveredRole = null;
  }

  // Update tooltip position to appear next to cursor
  updateTooltipPosition(event: MouseEvent) {
    this.tooltipPosition = {
      x: event.clientX + 20,
      y: event.clientY - 10
    };
  }

  // Show action tooltip (Edit/Delete)
  showActionTooltip(event: MouseEvent, action: string, isDisabled: boolean = false) {
    if (isDisabled) {
      this.actionTooltip = `${action} (Disabled for default roles)`;
    } else {
      this.actionTooltip = action;
    }
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.actionTooltipPosition = {
      x: rect.left + rect.width / 2 - 25,
      y: rect.top - 32
    };
  }

  // Hide action tooltip
  hideActionTooltip() {
    this.actionTooltip = '';
  }
 
  // 🔍 Search filter
  onSearch(term: string) {
    const searchTerm = term.toLowerCase();
    this.filteredRoles = this.roles.filter(role =>
      role.roleInfo.name.toLowerCase().includes(searchTerm) ||
      role.description.toLowerCase().includes(searchTerm)
    );
  }
 
  // ➕ Open modal for new role
  openModal() {
    this.isEditMode = false;
    this.editingIndex = -1;
    this.roleId = null;
    this.originalPermissions = [];
    this.newRole = {
      roleInfo: { icon: 'shield', name: '' },
      description: '',
      users: 0,
      created: '',
      cloneFrom: '',
      permissionIds: []
    };
    this.isModalOpen = true;
  }
 
  // 🔄 Handle clone from selection
  onCloneFromChange() {
    if (!this.newRole.cloneFrom) return;
    const roleToClone = this.roles.find(r => r.roleInfo.name === this.newRole.cloneFrom);
    if (roleToClone && roleToClone.permissionIds) {
      this.newRole.permissionIds = [...roleToClone.permissionIds];
    }
  }
 
  // Handle edit button click
  handleEditClick(role: Role, event: Event) {
    event.stopPropagation();
    if (role.isDefault) {
      return;
    }
    
    const index = this.roles.findIndex(r => 
      r.roleInfo.name === role.roleInfo.name && r.created === role.created
    );
    
    if (index !== -1) {
      this.editRole(role, index);
    }
  }



  // ✏️ Edit role (prefills modal)
  editRole(role: Role, index: number) {
    // Don't allow editing default roles
    if (role.isDefault) {
      return;
    }

    this.isEditMode = true;
    this.editingIndex = index;
    this.roleId = this.roles[index]?.id || null;
    this.newRole = {
      roleInfo: { ...role.roleInfo },
      description: role.description,
      users: role.users,
      created: role.created,
      cloneFrom: role.cloneFrom || '',
      permissionIds: Array.isArray(role.permissionIds)
        ? [...role.permissionIds]
        : []
    };
  this.originalPermissions = [...(this.newRole.permissionIds || [])];
    this.isModalOpen = true;
  }
 
  // 💾 Save role (create or update)
  saveRole() {
    // Validate role name
    if (!this.newRole.roleInfo?.name) {
      alert('Role name is required.');
      return;
    }

    const trimmedName = this.newRole.roleInfo.name.trim();

    if (!trimmedName) {
      alert('Role name is required.');
      return;
    }

    // Validate description
    if (!this.newRole.description || !this.newRole.description.trim()) {
      alert('Description is required.');
      return;
    }

    // Check for duplicates (skip current role when editing)
    const duplicate = this.roles.some(
      (r, i) => r.roleInfo.name.toLowerCase() === trimmedName.toLowerCase() && i !== this.editingIndex
    );
    if (duplicate) {
      alert('A role with this name already exists.');
      return;
    }

    // Validate permissions
    console.log('Validating permissionIds:', this.newRole.permissionIds);
    if (!this.newRole.permissionIds || this.newRole.permissionIds.length === 0) {
      alert('Please assign at least one permission.');
      return;
    }

    const roleToSave: Role = {
      id: this.isEditMode && this.editingIndex > -1 ? this.roles[this.editingIndex].id : '',
      roleInfo: {
        icon: 'shield',
        name: trimmedName
      },
      description: this.newRole.description.trim(),
      users: this.newRole.users || 0,
      created: this.newRole.created || new Date().toISOString().split('T')[0],
      cloneFrom: this.newRole.cloneFrom,
      permissionIds: [...(this.newRole.permissionIds || [])],
      isDefault: false
    };

    if (this.isEditMode && this.editingIndex > -1) {
      // Delegate to updateRole() for consistent behavior and logging
      this.updateRole();
      return;
    } else {
      // Create new role via API
      const payload = {
        name: roleToSave.roleInfo.name,
        description: roleToSave.description,
        permissionIds: roleToSave.permissionIds
      };
      console.log('Creating role with payload:', JSON.stringify(payload, null, 2));
      this.rolesService.createRole(payload).subscribe({
        next: (response) => {
          const data: any = (response && (response as any).data) ? (response as any).data : response;
          this.toastr.success(
            `${roleToSave.roleInfo.name} created successfully`,
            '',
            {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            }
          );
          // Optimistically add/update the created role locally if API returns it
          if (data) {
            const created: Role = {
              id: String(data.id ?? ''),
              roleInfo: { icon: 'shield', name: data.name || roleToSave.roleInfo.name },
              description: data.description ?? roleToSave.description,
              users: data.userCount ?? 0,
              created: data.createdAt ? String(data.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
              cloneFrom: '',
              permissionIds: Array.isArray(data.permissions)
                ? data.permissions.map((p: any) => typeof p === 'object' && p.id ? p.id : Number(p))
                : [...(roleToSave.permissionIds || [])],
              isDefault: false
            };
            // If role with same id exists, replace; otherwise push
            const idx = this.roles.findIndex(r => String(r.id) === String(created.id));
            if (idx > -1) {
              this.roles[idx] = created;
            } else {
              this.roles.unshift(created);
            }
            this.filteredRoles = [...this.roles];
          }
          // Ensure we have the latest from server
          this.fetchRoles();
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to create role:', error);
          this.toastr.error('Failed to create role', '', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
        }
      });
    }
  }

  // Standalone update method to align with requested flow and to update UI immediately
  updateRole() {
    const effectiveRoleId = this.roleId || (this.editingIndex > -1 ? this.roles[this.editingIndex]?.id : null);
    if (!effectiveRoleId) return;

    const payload = {
      name: this.newRole.roleInfo!.name,
      description: this.newRole.description,
      permissionIds: Array.isArray(this.newRole.permissionIds)
        ? [...this.newRole.permissionIds]
        : []
    };

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 UPDATING ROLE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Role ID:', effectiveRoleId);
    console.log('Role Name:', payload.name);
    console.log('📤 BEFORE API CALL:');
  console.log('  - Original permissionIds:', JSON.stringify(this.originalPermissions));
  console.log('  - New permissionIds to save:', JSON.stringify(payload.permissionIds));
  console.log('  - PermissionIds count:', payload.permissionIds.length);
  console.log('📦 Full payload being sent:', JSON.stringify(payload, null, 2));

    this.rolesService.updateRole(effectiveRoleId, payload).subscribe({
      next: (response) => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('📥 BACKEND RESPONSE RECEIVED');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Full response object:', JSON.stringify(response, null, 2));
        
        const data: any = (response && (response as any).data) ? (response as any).data : response;
        const returnedPermissionIds = Array.isArray(data?.permissions)
          ? data.permissions.map((p: any) => typeof p === 'object' && p.id ? p.id : Number(p))
          : [];
        
        console.log('📊 PERMISSION IDS COMPARISON:');
        console.log('  ✅ Sent to backend:', JSON.stringify(payload.permissionIds));
        console.log('  ❓ Returned from backend:', JSON.stringify(returnedPermissionIds));
        console.log('  🔢 Sent count:', payload.permissionIds.length);
        console.log('  🔢 Returned count:', returnedPermissionIds.length);
        
        if (payload.permissionIds.length !== returnedPermissionIds.length) {
          console.error('🚨 PERMISSION IDS MISMATCH DETECTED!');
          console.error('Backend did not save/return the permission IDs correctly');
        } else if (JSON.stringify(payload.permissionIds.sort()) !== JSON.stringify(returnedPermissionIds.sort())) {
          console.warn('⚠️ Permission ID content differs between sent and received');
        } else {
          console.log('✅ Permission IDs match - backend saved correctly!');
        }
        
        this.toastr.success('Role updated successfully', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });

        // Update local list immediately for snappy UX
        const idx = this.roles.findIndex(r => r.id === effectiveRoleId);
        if (idx > -1 && data) {
          const updatedPermissionIds = Array.isArray(data.permissions)
            ? data.permissions.map((p: any) => typeof p === 'object' && p.id ? p.id : Number(p))
            : [];
          
          console.log('🔄 Updating local role cache with permissionIds:', JSON.stringify(updatedPermissionIds));
          
          this.roles[idx] = {
            ...this.roles[idx],
            roleInfo: { ...this.roles[idx].roleInfo, name: data.name || this.roles[idx].roleInfo.name },
            description: data.description ?? this.roles[idx].description,
            users: data.userCount ?? this.roles[idx].users,
            created: data.createdAt ? String(data.createdAt).split('T')[0] : this.roles[idx].created,
            permissionIds: updatedPermissionIds
          };
          this.filteredRoles = [...this.roles];
          
          console.log('✅ Local role updated. Current permissionIds in cache:', JSON.stringify(this.roles[idx].permissionIds));
        }

        // Also refetch from server to guarantee backend persistence
        console.log('🔄 Fetching roles from server to verify persistence...');
        this.fetchRoles();

        this.closeModal();
        this.cdr.detectChanges();
        console.log('═══════════════════════════════════════════════════════\n');
      },
      error: (error) => {
        console.log('═══════════════════════════════════════════════════════');
        console.error('❌ ERROR UPDATING ROLE');
        console.log('═══════════════════════════════════════════════════════');
        console.error('Error details:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        console.log('═══════════════════════════════════════════════════════\n');
        
        this.toastr.error('Failed to update role', '', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }
 
  // 🗑️ Delete role
  handleDeleteClick(role: Role, event: Event) {
    event.stopPropagation();
    if (role.isDefault) return;
    this.roleToDelete = role;
    this.deleteIndex = this.roles.findIndex(r => r.roleInfo.name === role.roleInfo.name && r.created === role.created);
    this.showDeleteModal = true;
  }

  confirmDeleteRole() {
    if (this.deleteIndex > -1 && this.roleToDelete) {
      const id = this.roleToDelete.id;
      this.rolesService.deleteRole(id).subscribe({
        next: () => {
          this.toastr.success(
            `${this.roleToDelete?.roleInfo.name} deleted successfully`,
            '',
            {
              timeOut: 3000,
              progressBar: true,
              closeButton: true
            }
          );
          // Always close modal after successful delete
          this.showDeleteModal = false;
          this.roleToDelete = null;
          this.deleteIndex = -1;
          this.cdr.detectChanges(); // Force UI update
          this.fetchRoles();
        },
        error: () => {
          this.toastr.error('Failed to delete role', '', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
        },
        complete: () => {
          // Fallback: ensure modal is closed if not already
          this.showDeleteModal = false;
          this.roleToDelete = null;
          this.deleteIndex = -1;
        }
      });
    } else {
      this.showDeleteModal = false;
      this.roleToDelete = null;
      this.deleteIndex = -1;
    }
  }

  cancelDeleteRole() {
    this.showDeleteModal = false;
    this.roleToDelete = null;
    this.deleteIndex = -1;
  }
 
  closeModal() {
    console.log('Closing modal...');
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingIndex = -1;
    this.roleId = null;
    this.originalPermissions = [];
    this.newRole = {
      roleInfo: { icon: 'shield', name: '' },
      description: '',
      users: 0,
      created: '',
      cloneFrom: '',
      permissionIds: []
    };
    this.cdr.detectChanges(); // Force UI update
  }
 
  getPermissionNameById(permissionId: number): string {
    const permission = this.permissionsList.find(p => p.id === permissionId);
    return permission?.name || 'Unknown';
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.newRole.permissionIds?.includes(permissionId) || false;
  }

  togglePermission(permissionId: number) {
    if (!this.newRole.permissionIds) {
      this.newRole.permissionIds = [];
    }
    const index = this.newRole.permissionIds.indexOf(permissionId);
    if (index > -1) {
      this.newRole.permissionIds.splice(index, 1);
      console.log(`❌ Removed permissionId: ${permissionId}`);
    } else {
      this.newRole.permissionIds.push(permissionId);
      console.log(`✅ Added permissionId: ${permissionId}`);
    }
    console.log('📋 Current permissionIds after toggle:', JSON.stringify(this.newRole.permissionIds));
    // Trigger change detection manually to prevent NG0100 error
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }
 
  // ⚙️ Table actions (Edit/Delete) - Not used now as we have custom buttons
  handleTableAction(event: { action: string; row: Role; rowIndex?: number }) {
    const { action, row } = event;
    const index = this.roles.findIndex(r => 
      r.roleInfo.name === row.roleInfo.name && r.created === row.created
    );
    
    if (index === -1) {
      console.error('Role not found:', row);
      return;
    }

    // Don't allow actions on default roles
    if (row.isDefault && (action === 'edit' || action === 'delete')) {
      return;
    }
 
    if (action === 'edit') {
      this.editRole(row, index);
    } else if (action === 'delete') {
      // Use modal-based delete confirmation
      this.roleToDelete = row;
      this.deleteIndex = index;
      this.showDeleteModal = true;
    }
  }
}