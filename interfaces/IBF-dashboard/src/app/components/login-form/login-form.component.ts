import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { ForgotPasswordPopoverComponent } from '../forgot-password-popover/forgot-password-popover.component';
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  public model = {
    email: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
  ) {}

  public onSubmit() {
    this.authService
      .login(this.model.email.toLowerCase(), this.model.password)
      .add(() => {
        this.loginForm.resetForm();
      });
  }

  public async presentPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: ForgotPasswordPopoverComponent,
      animated: true,
      cssClass: 'ibf-forgot-password-popover',
      translucent: true,
      showBackdrop: true,
    });

    popover.present();
  }
}
