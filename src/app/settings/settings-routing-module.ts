import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Settingsmain } from './pages/settingsmain/settingsmain';

const routes: Routes = [{ path: '', component: Settingsmain }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
