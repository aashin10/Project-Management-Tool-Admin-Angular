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
  ChevronDown 
} from 'lucide-angular';
import { SidebarSingleSection } from '../sidebar-single-section/sidebar-single-section';

@Component({
  selector: 'app-sidebar-home',
  imports: [
    SidebarHeader,
    LucideAngularModule,
    SidebarSingleSection
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
}
