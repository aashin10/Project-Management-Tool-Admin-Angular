import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Importnavigationservice } from '../../pages/importfromjira/importnavigationservice';

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
    'client_id=LlEIudxhc8hSon7CNwnNblzfGamJVvu2&' +
    'scope=read:jira-work read:jira-user&' +
    'redirect_uri=http://localhost:4200/projects/importfromjira&' +
    'response_type=code&' +
    'prompt=consent';

  onAuthorize() {
    console.log('Authorizing with Jira...');
    window.location.href = this.url;
  }
}
