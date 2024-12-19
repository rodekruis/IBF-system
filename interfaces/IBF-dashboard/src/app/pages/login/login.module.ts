import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from 'src/app/pages/login/login.page';
import { LoginPageRoutingModule } from 'src/app/pages/login/login-routing.module';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    LoginPageRoutingModule,
  ],
  declarations: [LoginPage],
})
export class LoginPageModule {}
