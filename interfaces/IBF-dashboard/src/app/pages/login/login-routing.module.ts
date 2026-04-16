import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackdoorPage } from 'src/app/pages/login/backdoor/backdoor.page';
import { LoginPage } from 'src/app/pages/login/login.page';

const routes: Routes = [
  { path: '', component: LoginPage },
  { path: 'backdoor', component: BackdoorPage },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LoginPageRoutingModule {}
