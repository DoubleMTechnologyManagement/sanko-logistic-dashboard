import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OutboundComponent } from './outbound/outbound.component';
import { InboundComponent } from './inbound/inbound.component';


const routes: Routes = [
  { path: 'outbound', component: OutboundComponent },
  { path: '', component: InboundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
