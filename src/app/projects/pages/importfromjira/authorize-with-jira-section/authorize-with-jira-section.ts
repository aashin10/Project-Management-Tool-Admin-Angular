import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ImportNavigationService } from '../services/import-navigation-service';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authorize-with-jira-section',
  imports: [CustomButton, CommonModule],
  templateUrl: './authorize-with-jira-section.html',
  styleUrl: './authorize-with-jira-section.css',
})
export class AuthorizeWithJiraSection implements OnInit {
  public constructor(
    private importNavigationService: ImportNavigationService,
    private cdr: ChangeDetectorRef
  ) {}

  validAccessToken: boolean = false;
  buttonLabel = 'Authorize';

  ngOnInit() {
    const token = sessionStorage.getItem('jira_access_token');
    console.log('Token on init:', token);
    if (token && !this.isJwtExpired(token)) {
      this.validAccessToken = true;
      this.buttonLabel = 'Use another account';
    }
  }

  url =
    'https://auth.atlassian.com/authorize?' +
    'audience=api.atlassian.com&' +
    'client_id=' +
    environment.jiraClientId +
    '&' +
    'scope=read:jira-work read:jira-user&' +
    'redirect_uri=' +
    environment.jiraRedirectUri +
    '&' +
    'response_type=code&' +
    'prompt=consent';

  onAuthorize() {
    alert('You will be redirected to Jira to authorize access.');
    window.location.href = this.url;
  }

  isJwtExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp) {
        console.warn('No expiry field in token');
        return false;
      }

      const now = Math.floor(Date.now() / 1000); // current time in seconds
      return exp < now;
    } catch (error) {
      console.error('Invalid JWT format', error);
      return true;
    }
  }
}
