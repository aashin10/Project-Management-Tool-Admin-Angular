import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Reportsmain } from './pages/reportsmain/reportsmain';

const routes: Routes = [{ path: '', component: Reportsmain }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
