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

  onAuthorize() {
    console.log('Authorizing with Jira...');
    this.importNavigationService.onNext();
  }
}
