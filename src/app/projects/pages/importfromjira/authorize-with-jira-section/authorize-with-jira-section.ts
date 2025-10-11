import { Component } from '@angular/core';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { ImportNavigationService } from '../services/import-navigation-service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-authorize-with-jira-section',
  imports: [CustomButton],
  templateUrl: './authorize-with-jira-section.html',
  styleUrl: './authorize-with-jira-section.css',
})
export class AuthorizeWithJiraSection {
  public constructor(private importNavigationService: ImportNavigationService) {}
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
    window.location.href = this.url;
  }
}
