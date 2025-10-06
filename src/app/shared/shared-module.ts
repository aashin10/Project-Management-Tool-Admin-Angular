import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { Table } from './table/table';
import { CustomButton } from './custom-button/custom-button';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    Table,CustomButton
  ],
  exports:[Table,CustomButton]
})
export class SharedModule { }
