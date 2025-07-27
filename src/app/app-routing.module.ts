import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardViewComponent } from './dashboard-view/dashboard-view.component';

const routes: Routes = [
  { path: 'dashboard-view', component: DashboardViewComponent },
  { path: 'dashboard-view/:assembly/:painting/:metal', component: DashboardViewComponent },
  { path: 'view', component: DashboardViewComponent },
  { path: 'view/:statType/:value', component: DashboardViewComponent },
  { path: '', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
