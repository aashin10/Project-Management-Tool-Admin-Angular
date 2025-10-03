import { Component } from '@angular/core';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';

@Component({
  selector: 'app-userslist',
  imports: [Sectiontitle, CustomButton],
  templateUrl: './userslist.html',
  styleUrl: './userslist.css'
})
export class Userslist {
  onAddUser() {
    // Logic to add a new user
    console.log('Add User button clicked');
  }

}
