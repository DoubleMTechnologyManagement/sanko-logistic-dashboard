import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutboundComponent } from './outbound/outbound.component';
import { InboundComponent } from './inbound/inbound.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CustomerComponent } from './customer/customer.component';

const routes: Routes = [
<<<<<<< HEAD
  { path: 'dashboard-view', component: DashboardViewComponent },
  { path: 'dashboard-view/:assembly/:painting/:metal', component: DashboardViewComponent },
  { path: 'view', component: DashboardViewComponent },
  { path: 'view/:statType/:value', component: DashboardViewComponent },
  { path: '', component: DashboardComponent },
=======
  { path: 'outbound', component: OutboundComponent },
  { path: 'customer', component: CustomerComponent },
  { path: '', component: InboundComponent },
>>>>>>> parent of 3853b50 (feat: init project and add view dashboard and detail)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
