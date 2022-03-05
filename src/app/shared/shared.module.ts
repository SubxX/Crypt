import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendTransactionPopupComponent } from './components/send-transaction-popup/send-transaction-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SendTransactionPopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SendTransactionPopupComponent
  ]
})
export class SharedModule { }
