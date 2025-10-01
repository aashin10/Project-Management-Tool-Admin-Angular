import { Component } from '@angular/core';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { 
  LucideAngularModule, 
  Home, 
  Folder, 
  Building, 
  User, 
  Shield, 
  BarChart3, 
  Settings,
  ChevronDown, 
  Circle
} from 'lucide-angular';
import { SidebarSingleSection } from '../sidebar-single-section/sidebar-single-section';
import { SidebarAccordionSection } from '../sidebar-accordion-section/sidebar-accordion-section';
import { SidebarSubSection } from '../sidebar-sub-section/sidebar-sub-section';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-sidebar-home',
  imports: [
    SidebarHeader,
    LucideAngularModule,
    SidebarSingleSection,
    SidebarAccordionSection,
    SidebarSubSection,
    RouterLinkActive,
    RouterLink,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './sidebar-home.html',
  styleUrl: './sidebar-home.css'
})
export class SidebarHome {
  readonly Home = Home;
  readonly Folder = Folder;
  readonly Building = Building;
  readonly User = User;
  readonly Shield = Shield;
  readonly BarChart3 = BarChart3;
  readonly Settings = Settings;
  readonly ChevronDown = ChevronDown;
  

  // navbarItems = [
  //   {
  //     label: 'Dashboard',
  //     icon: 'lucide lucide-house w-4 h-4',
  //     route: '/dashboard',
  //     children: [],
  //     expanded: false,
  //   },
  //   {
  //     label: 'Projects',
  //     icon: 'folder',
  //     route: '',
  //     expanded: false,
  //     children: [
  //       { label: 'All Projects', route: '/projects' },
  //       { label: 'Create Project', route: '/projects/create' },
  //       { label: 'Import from Jira', route: '/projects/importfromjira' },
  //     ],
  //   },
  //   {
  //     label: 'DU Management',
  //     icon: 'lucide lucide-building w-4 h-4',
  //     route: '',
  //     expanded: false,
  //     children: [
  //       { label: 'All DUs', route: '/dus/all' },
  //       { label: 'Create DU', route: '/dus/invite' },
  //     ],
  //   },
  //   {
  //     label: 'User Management',
  //     icon: 'lucide lucide-user w-4 h-4',
  //     route: '',
  //     expanded: false,
  //     children: [
  //       { label: 'All Users', route: '/users' },
  //       { label: 'Create User', route: '/users/create' },
  //     ],
  //   },
  //   {
  //     label: 'Roles and Permissions',
  //     icon: 'lucide lucide-shield w-4 h-4',
  //     route: '',
  //     expanded: false,
  //     children: [
  //       { label: 'All Roles', route: '/roles' },
  //       { label: 'Create Role', route: '/roles/create' },
  //     ],
  //   },
  //   {
  //     label: 'Reports',
  //     icon: 'lucide lucide-bar-chart-3 w-4 h-4',
  //     route: '/reports',
  //     expanded: false,
  //     children: [],
  //   },
  //   {
  //     label: 'Settings',
  //     icon: 'lucide lucide-settings w-4 h-4',
  //     route: '',
  //     expanded: false,
  //     children: [
  //       { label: 'System Settings', route: '/settings/system' },
  //       { label: 'Import/Export', route: '/settings/import' },
  //     ],
  //   },
  // ];
 
  toggle(item: any) {
    item.expanded = !item.expanded;
  }
}
