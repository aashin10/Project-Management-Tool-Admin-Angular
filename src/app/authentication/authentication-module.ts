import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing-module';
import { CustomButton } from '../shared/custom-button/custom-button';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    CustomButton
  ]
})
export class AuthenticationModule { }
