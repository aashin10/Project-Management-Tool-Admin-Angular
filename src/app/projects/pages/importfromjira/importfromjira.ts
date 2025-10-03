import { Component } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { LucideAngularModule, Users, Settings, Database } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Importprojectslist } from '../../components/importprojectslist/importprojectslist';

@Component({
  selector: 'app-importfromjira',
  imports: [Sectiontitle, CommonModule, LucideAngularModule, SearchBar, Importprojectslist],
  templateUrl: './importfromjira.html',
  styleUrl: './importfromjira.css',
})
export class Importfromjira {
  sectionTitle = 'Import from Jira';
  sectionDescription = 'Import all your projects now from Jira';

  currentStep = 1;

  importSteps = [
    {
      step: 1,
      title: 'Import Users',
      description: 'Set up your Jira connection details',
      icon: Settings,
    },
    {
      step: 2,
      title: 'Authorize Jira',
      description: 'Choose which Jira projects to import',
      icon: Database,
    },
    {
      step: 3,
      title: 'Select Projects',
      description: 'Import users from your existing system',
      icon: Users,
    },
  ];

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
