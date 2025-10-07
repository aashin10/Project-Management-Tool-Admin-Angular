import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Userslist } from './pages/userslist/userslist';

const routes: Routes = [
  {path: '', component: Userslist}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
