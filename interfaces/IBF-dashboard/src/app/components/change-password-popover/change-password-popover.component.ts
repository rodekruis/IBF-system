import { Component, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-change-password-popover',
  templateUrl: './change-password-popover.component.html',
  styleUrls: ['./change-password-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    this.authService.changePassword(this.model.newPassword).add(async () => {
      this.changePasswordForm.resetForm();
      await this.popoverController.dismiss();
    });
  }

  onChange() {
    this.showDifferentPasswordMessage = false;
  }

  public async closePopover(): Promise<void> {
    await this.popoverController.dismiss();
  }
}
