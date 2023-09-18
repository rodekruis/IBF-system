import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-change-password-popover',
  templateUrl: './change-password-popover.component.html',
  styleUrls: ['./change-password-popover.component.scss'],
})
export class ChangePasswordPopoverComponent {
  @ViewChild('changePasswordForm')
  public changePasswordForm: NgForm;

  public showDifferentPasswordMessage = false;

  public model = {
    newPassword: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
  ) {}

  public onSubmit() {
    if (!this.changePasswordForm.form.valid) {
      return;
    }

    if (this.model.confirmPassword !== this.model.newPassword) {
      this.showDifferentPasswordMessage = true;
      return;
    }

    this.authService.changePassword(this.model.newPassword).add(() => {
      this.changePasswordForm.resetForm();
      this.popoverController.dismiss();
    });
  }

  onChange() {
    this.showDifferentPasswordMessage = false;
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
