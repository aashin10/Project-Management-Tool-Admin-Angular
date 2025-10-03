import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';
import { table } from 'console';
import { Table } from './table/table';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    Table
  ],
  exports:[Table]
})
export class SharedModule { }
