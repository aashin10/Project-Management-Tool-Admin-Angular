import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { Table } from './table/table';
import { CustomButton } from './custom-button/custom-button';
import { Modal } from './modal/modal';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    Table,CustomButton,Modal
  ],
  exports:[Table,CustomButton,Modal]
})
export class SharedModule { }
