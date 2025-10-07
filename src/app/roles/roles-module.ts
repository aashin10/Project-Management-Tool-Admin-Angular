import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing-module';
import { Roleslist } from './pages/roleslist/roleslist';
import { Sectiontitle } from '../shared/sectiontitle/sectiontitle';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RolesRoutingModule,
    Sectiontitle,
    Roleslist
  ]
})
export class RolesModule { }
