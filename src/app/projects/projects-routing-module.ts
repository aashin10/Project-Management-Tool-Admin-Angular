import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Createproject } from './pages/createproject/createproject';
import { Importfromjira } from './pages/importfromjira/importfromjira';
import { Projectslist } from './pages/projectslist/projectslist';
import { IndividualprojectComponent } from './pages/individualproject/individualproject';

const routes: Routes = [
  { path: '', component: Projectslist },
  { path: 'create', component: Createproject },
  { path: 'importfromjira', component: Importfromjira },
  { path: ':id', component: IndividualprojectComponent },
  { path: ':id/edit', component: IndividualprojectComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}