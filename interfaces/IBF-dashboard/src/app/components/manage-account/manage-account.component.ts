import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService, UserResponse } from 'src/app/auth/auth.service';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import { User } from 'src/app/models/user/user.model';
import { USER_ROLE_LABEL } from 'src/app/models/user/user-role.enum';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-manage-account',
  imports: [
    IonItem,
    IonInput,
    IonList,
    IonLabel,
    TranslateModule,
    IonButton,
    FormsModule,
  ],
  templateUrl: './manage-account.component.html',
})
export class ManageAccountComponent implements OnDestroy {
  @ViewChild('accountForm')
  public accountForm: NgForm;

  private authSubscription: Subscription;
  public email = '';
  public roleLabel = null;
  public model = {
    firstName: '',
    middleName: '',
    lastName: '',
    whatsappNumber: '',
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private translateService: TranslateService,
    private toastController: ToastController,
  ) {
    this.authSubscription = this.authService
      .getAuthSubscription()
      .subscribe(this.onAuthChange);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  private onAuthChange = (user: null | User) => {
    if (!user) {
      return;
    }

    if (this.accountForm) {
      this.accountForm.resetForm(user);
    } else {
      this.model.firstName = user.firstName;
      this.model.middleName = user.middleName;
      this.model.lastName = user.lastName;
      this.model.whatsappNumber = user.whatsappNumber;
      this.email = user.email;
      this.roleLabel = USER_ROLE_LABEL[user.userRole];
    }
  };

  public onSubmit() {
    const presentToastError = this.translateService.instant(
      'common.error.present-toast',
    ) as string;

    this.userService.updateUser(this.model).subscribe({
      next: (userResponse: UserResponse) => {
        this.authService.setUser(userResponse);

        const updateMessageSuccess = this.translateService.instant(
          'manage.account.updated',
        ) as string;

        this.presentToast(updateMessageSuccess).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
      error: () => {
        const updateMessageFailure = this.translateService.instant(
          'common.error.unknown',
        ) as string;

        this.presentToast(updateMessageFailure).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
    });
  }

  async presentToast(
    message: string,
    position: 'bottom' | 'middle' | 'top' = TOAST_POSITION,
  ) {
    const toast = await this.toastController.create({
      message,
      duration: TOAST_DURATION,
      position,
    });

    await toast.present();
  }
}
