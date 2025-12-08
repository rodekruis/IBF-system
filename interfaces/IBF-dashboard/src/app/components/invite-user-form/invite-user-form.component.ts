import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  PopoverController,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Item,
  TypeAheadComponent,
} from 'src/app/components/type-ahead/type-ahead.component';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import { User } from 'src/app/models/user/user.model';
import { USER_ROLE_LABEL, UserRole } from 'src/app/models/user/user-role.enum';
import { UserService } from 'src/app/services/user.service';
import { ErrorResponse } from 'src/app/types/api';

@Component({
  selector: 'app-invite-user-form',
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './invite-user-form.component.html',
  providers: [PopoverController],
})
export class InviteUserFormComponent {
  @Input() userRoles: Item[] = [];
  @Input() userCountries: Item[] = [];

  @Output() readonly user = new EventEmitter<User>();

  public USER_ROLE_LABEL = USER_ROLE_LABEL;
  public model = {
    email: '',
    userRole: UserRole.Viewer,
    firstName: '',
    middleName: '',
    lastName: '',
    whatsappNumber: '',
    countryCodesISO3: [],
  };

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private toastController: ToastController,
    private popoverController: PopoverController,
  ) {}

  public onSubmit() {
    const presentToastError = String(
      this.translateService.instant('common.error.present-toast'),
    );

    this.userService.createUser(this.model).subscribe({
      next: (user: User) => {
        const inviteMessageSuccess = String(
          this.translateService.instant('manage.users.invited', {
            email: user.email,
          }),
        );

        this.presentToast(inviteMessageSuccess)
          .then(() => {
            this.user.emit(user);
          })
          .catch((error: unknown) => {
            console.error(`${presentToastError}: ${JSON.stringify(error)}`);
          });
      },
      error: ({ error: { message } }: ErrorResponse) => {
        console.error('Error inviting user:', message);

        const inviteMessageFailure =
          message ??
          String(this.translateService.instant('common.error.unknown'));

        this.presentToast(inviteMessageFailure).catch((error: unknown) => {
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

  public async showUserRoles(event: Event) {
    const popover = await this.popoverController.create({
      component: TypeAheadComponent,
      componentProps: {
        items: this.userRoles,
        selectedItems: this.model.userRole,
        selectionChange: {
          emit: (userRole: UserRole) => {
            this.model.userRole = userRole;
          },
        },
        selectionCancel: { emit: () => popover.dismiss() },
      },
      event,
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      size: 'cover',
      dismissOnSelect: false,
      showBackdrop: false,
    });

    await popover.present();
  }

  public async showUserCountries(event: Event) {
    const popover = await this.popoverController.create({
      component: TypeAheadComponent,
      componentProps: {
        enableSearch: this.userCountries.length > 8, // size 8 based on height of type-ahead
        items: this.userCountries,
        selectedItems: this.model.countryCodesISO3,
        selectionChange: {
          emit: (countryCodesISO3: string[]) => {
            this.model.countryCodesISO3 = countryCodesISO3;
          },
        },
        selectionCancel: { emit: () => popover.dismiss() },
      },
      event,
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      size: 'cover',
      dismissOnSelect: false,
      showBackdrop: false,
    });

    await popover.present();
  }

  getCountryLabel(countryCodeISO3: string) {
    return this.userCountries.find(({ value }) => value === countryCodeISO3)
      ?.label;
  }
}
