import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { LucideAngularModule, Users, Settings, Database } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ImportNavigationService } from './services/import-navigation-service';
import { ActivatedRoute } from '@angular/router';
import { JiraService } from './services/jira-service';
import { HttpClientModule } from '@angular/common/http';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { ImportProcessSection } from './import-process-section/import-process-section';

@Component({
  selector: 'app-importfromjira',
  imports: [
    Sectiontitle,
    CommonModule,
    LucideAngularModule,
    ImportProcessSection,
    HttpClientModule,
    CustomButton,
  ],
  templateUrl: './importfromjira.html',
  styleUrl: './importfromjira.css',
})
export class Importfromjira implements OnInit {
  sectionTitle = 'Import from Jira';
  sectionDescription = 'Import all your projects now from Jira';

  public constructor(
    private importNavigationService: ImportNavigationService,
    private route: ActivatedRoute,
    private jiraService: JiraService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
      this.importNavigationService.next$.subscribe(() => this.nextStep());
      this.importNavigationService.previous$.subscribe(() => this.previousStep());

      this.route.queryParams.subscribe(async (params) => {
        if (params['code']) {
          const authorization_code = params['code'];
          console.log('Authorization Code:', authorization_code);

          try {
            const response = await this.jiraService.exchangeToken(authorization_code);
            console.log('Token Exchange Response:', response);
            sessionStorage.setItem('jira_access_token', response.access_token);
            this.toStep(3);
            this.cdr.detectChanges();
            //Remove url params
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Error exchanging token:', error);
          }
        }
      });
    }
  }

  currentStep = 1;

  importSteps = [
    {
      step: 1,
      title: 'Import Users (Optional)',
      description: 'Upload a CSV file to import users, or skip this step to import users later',
      icon: Settings,
    },
    {
      step: 2,
      title: 'Authorize with Jira',
      description: 'Sign in to your Jira account to access and import projects',
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

  toStep(step: number) {
    this.currentStep = step;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}
