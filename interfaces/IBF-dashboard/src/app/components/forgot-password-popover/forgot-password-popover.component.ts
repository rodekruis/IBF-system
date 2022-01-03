import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgot-password-popover',
  templateUrl: './forgot-password-popover.component.html',
  styleUrls: ['./forgot-password-popover.component.scss'],
})
export class ForgotPasswordPopoverComponent implements OnInit {
  public emailAddress = environment.supportEmailAddress;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
