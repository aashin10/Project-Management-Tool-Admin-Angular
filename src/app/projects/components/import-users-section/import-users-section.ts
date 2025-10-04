import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { Importnavigationservice } from '../../pages/importfromjira/importnavigationservice';

@Component({
  selector: 'app-import-users-section',
  imports: [CustomButton],
  templateUrl: './import-users-section.html',
  styleUrl: './import-users-section.css',
})
export class ImportUsersSection {
  public constructor(private importNavigationService: Importnavigationservice) {}

  onContinue() {
    console.log('Importing users...');
    this.importNavigationService.onNext();
  }
}
