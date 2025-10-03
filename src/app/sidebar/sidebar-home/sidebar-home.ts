import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: { label: string; route: string }[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-home.html',
  styleUrl: './sidebar-home.css'
})
export class SidebarHome {
  isCollapsed = false;

  // SVG Icons
  dashboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house w-4 h-4" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`;
  
  projectsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open w-4 h-4" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>`;
  
  buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building w-4 h-4" aria-hidden="true"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`;
  
  userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-4 h-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  
  shieldIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-4 h-4" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`;
  
  reportsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3 w-4 h-4" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`;
  
  settingsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

  // Menu structure
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: this.dashboardIcon,
      route: '/dashboard',
      children: []
    },
    {
      label: 'Projects',
      icon: this.projectsIcon,
      expanded: false,
      children: [
        { label: 'All Projects', route: '/projects' },
        { label: 'Create Projects', route: '/projects/create' },
        { label: 'Import From Jira', route: '/projects/importfromjira' }
      ]
    },
    {
      label: 'DU Management',
      icon: this.buildingIcon,
      expanded: false,
      children: [
        { label: 'View All DUs', route: '/deliveryunits' },
        { label: 'Add new DU', route: '/deliveryunits/add' }
      ]
    },
    {
      label: 'User Management',
      icon: this.userIcon,
      expanded: false,
      children: [
        { label: 'All Users', route: '/users' },
        { label: 'Create User', route: '/users/create' }
      ]
    },
    {
      label: 'Roles and Permissions',
      icon: this.shieldIcon,
      expanded: false,
      children: [
        { label: 'All Roles', route: '/roles' },
        { label: 'Create Role', route: '/roles/create' }
      ]
    },
    {
      label: 'Reports',
      icon: this.reportsIcon,
      route: '/reports',
      children: []
    },
    {
      label: 'Settings',
      icon: this.settingsIcon,
      expanded: false,
      children: [
        { label: 'System Settings', route: '/settings/system' },
        { label: 'Import/Export', route: '/importexport' }
      ]
    }
  ];

  constructor(private sanitizer: DomSanitizer, private router: Router) {
    // Auto-expand parent when child route is active
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.expandActiveParent();
      });
    
    // Initial check on component load
    this.expandActiveParent();
  }

  getSanitizedIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  toggleSection(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    
    // Collapse all accordions when sidebar is collapsed
    if (this.isCollapsed) {
      this.menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.expanded = false;
        }
      });
    } else {
      // Re-expand active parent when sidebar is expanded
      this.expandActiveParent();
    }
  }

  private expandActiveParent(): void {
    const currentUrl = this.router.url;
    
    this.menuItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const isActive = item.children.some(child => currentUrl.startsWith(child.route));
        if (isActive && !this.isCollapsed) {
          item.expanded = true;
        }
      }
    });
  }
}