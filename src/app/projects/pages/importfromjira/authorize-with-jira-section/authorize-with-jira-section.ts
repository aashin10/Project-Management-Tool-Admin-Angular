import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ImportNavigationService } from '../services/import-navigation-service';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { JiraService } from '../services/jira-service';

@Component({
  selector: 'app-authorize-with-jira-section',
  imports: [CustomButton, CommonModule],
  templateUrl: './authorize-with-jira-section.html',
  styleUrl: './authorize-with-jira-section.css',
})
export class AuthorizeWithJiraSection implements OnInit {
  constructor(
    private importNavigationService: ImportNavigationService,
    private cdr: ChangeDetectorRef,
    private jiraService: JiraService
  ) {
    console.log('JiraService in constructor:', this.importNavigationService);
  }
  validAccessToken: boolean = false;
  isLoadingUserDetails: boolean = true;
  buttonLabel = 'Authorize';
  userName: string = '';
  async ngOnInit() {
    const token = sessionStorage.getItem('jira_access_token');
    console.log('Token on init:', token);

    if (token && !this.jiraService.isJwtExpired(token)) {
      let localName = sessionStorage.getItem('jira_name');

      if (!localName) {
        const data = await this.jiraService.getMyDetails(token);
        const name = data.name;
        sessionStorage.setItem('jira_name', name);
        localName = name || '';
      }
      if (!localName) {
        localName = 'User';
      }
      this.userName = localName;
      this.buttonLabel = 'Use another account';
      this.validAccessToken = true;
      this.isLoadingUserDetails = false;
      this.cdr.detectChanges();
    }

    if (token && this.jiraService.isJwtExpired(token)) {
      this.cdr.detectChanges();
      // console.log('Token expired, removing from sessionStorage');
      // sessionStorage.removeItem('jira_access_token');
      // sessionStorage.removeItem('jira_name');
      const refreshToken = sessionStorage.getItem('jira_refresh_token');
      if (refreshToken) {
        try {
          const response = await this.jiraService.refreshAccessToken(refreshToken);
          sessionStorage.setItem('jira_access_token', response.access_token);
          if (response.refresh_token) {
            sessionStorage.setItem('jira_refresh_token', response.refresh_token);
          }
        } catch (error) {
          console.error('Error refreshing access token', error);
        }
      }
    }

    this.isLoadingUserDetails = false;
    this.cdr.detectChanges();
  }

  url =
    'https://auth.atlassian.com/authorize?' +
    'audience=api.atlassian.com&' +
    'client_id=' +
    environment.jiraClientId +
    '&' +
    'scope=' +
    'offline_access ' +
    'read:jira-work ' +
    'read:jira-user ' +
    'read:me ' +
    'read:board-scope:jira-software ' +
    'read:project:jira ' +
    'read:epic:jira-software ' +
    'read:project-role:jira ' +
    'read:sprint:jira-software ' +
    'read:issue:jira ' +
    'read:issue-details:jira&' +
    'redirect_uri=' +
    environment.jiraRedirectUri +
    '&' +
    'response_type=code&' +
    'prompt=consent&' +
    'state=secureRandomState123';

  onAuthorize() {
    window.location.href = this.url;
  }

  onContinueAsExistingUser() {
    this.importNavigationService.onNext();
  }
}
