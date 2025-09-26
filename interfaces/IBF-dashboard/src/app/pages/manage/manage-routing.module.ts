import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageAccountComponent } from 'src/app/components/manage-account/manage-account.component';
import { ManagePreferencesComponent } from 'src/app/components/manage-preferences/manage-preferences.component';
import { ManageUsersComponent } from 'src/app/components/manage-users/manage-users.component';
import { ManagePage } from 'src/app/pages/manage/manage.page';

const routes: Routes = [
  {
    path: '',
    component: ManagePage,
    children: [
      { path: 'account', component: ManageAccountComponent },
      { path: 'users', component: ManageUsersComponent },
      { path: 'preferences', component: ManagePreferencesComponent },
      { path: '', redirectTo: 'account', pathMatch: 'full' },
    ],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ManagePageRoutingModule {}
