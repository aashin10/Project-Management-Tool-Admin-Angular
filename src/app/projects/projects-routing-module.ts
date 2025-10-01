import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Createproject } from './pages/createproject/createproject';
import { Importfromjira } from './pages/importfromjira/importfromjira';
import { Individualproject } from './pages/individualproject/individualproject';
import { Projectslist } from './pages/projectslist/projectslist';

const routes: Routes = [
  { path: '', component: Projectslist },
  { path: 'create', component: Createproject },
  { path: 'importfromjira', component: Importfromjira },
  { path: 'individualproject', component: Individualproject }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
