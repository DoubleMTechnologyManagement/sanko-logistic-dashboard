import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutboundComponent } from './outbound/outbound.component';
import { InboundComponent } from './inbound/inbound.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CustomerComponent } from './customer/customer.component';

const routes: Routes = [
  { path: 'outbound', component: OutboundComponent },
  { path: 'customer', component: CustomerComponent },
  { path: '', component: InboundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
