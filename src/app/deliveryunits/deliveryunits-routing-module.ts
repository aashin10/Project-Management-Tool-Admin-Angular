import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Deliveryunitslist } from './pages/deliveryunitslist/deliveryunitslist';

const routes: Routes = [
   {
    path: '',
    component: Deliveryunitslist
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryunitsRoutingModule { }
