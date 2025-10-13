import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { SelectProjectsSection } from '../select-projects-section/select-projects-section';
import { AuthorizeWithJiraSection } from '../authorize-with-jira-section/authorize-with-jira-section';
import { ImportUsersSection } from '../import-users-section/import-users-section';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-process-section',
  imports: [
    LucideAngularModule,
    CommonModule,
    SelectProjectsSection,
    AuthorizeWithJiraSection,
    ImportUsersSection,
  ],
  templateUrl: './import-process-section.html',
  styleUrl: './import-process-section.css',
})
export class ImportProcessSection {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() stepNumber: number = 1;
}
