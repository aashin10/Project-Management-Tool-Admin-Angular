import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roleslist } from './pages/roleslist/roleslist';

const routes: Routes = [{path:'',component: Roleslist}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
