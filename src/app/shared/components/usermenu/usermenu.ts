import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { icons } from 'lucide-angular';

@Component({
  selector: 'app-user-menu',
  templateUrl: './usermenu.html',
  styleUrls: ['./usermenu.css'],
  imports: [CommonModule],
})
export class Usermenu {
  user = {
    name: 'Alan Jose',
    email: 'alan.jose@experionglobal.com',
  };

  menuItems = [
    { label: 'Logout', action: 'logout', destructive: true, icon: '/images/logout.svg' },
  ];
}
