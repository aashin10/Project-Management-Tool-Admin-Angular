import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Importnavigationservice } from '../../pages/importfromjira/importnavigationservice';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-authorize-with-jira-section',
  imports: [CustomButton],
  templateUrl: './authorize-with-jira-section.html',
  styleUrl: './authorize-with-jira-section.css',
})
export class AuthorizeWithJiraSection {
  public constructor(private importNavigationService: Importnavigationservice) {}
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
    console.log('Authorizing with Jira...');
    alert('Redirecting to: ' + this.url);
    console.log('Redirecting to:', this.url);
    window.location.href = this.url;
  }
}
