import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivationLogPage } from 'src/app/pages/dashboard/activation-log/activation.log.page';
import { DashboardPage } from 'src/app/pages/dashboard/dashboard.page';
import { StatusReportPage } from 'src/app/pages/dashboard/status-report/status-report.page';

const routes: Routes = [
  {
    path: 'dashboard/:countryCodeISO3',
    component: DashboardPage,
  },
  {
    path: 'log',
    component: ActivationLogPage,
  },
  {
    path: 'status-report',
    component: StatusReportPage,
  },
  {
    // XXX: figure out if we should do this
    path: '**',
    redirectTo: 'dashboard/italy',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
