import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { InviteUserFormComponent } from 'src/app/components/invite-user-form/invite-user-form.component';
import { Item } from 'src/app/components/type-ahead/type-ahead.component';
import { User } from 'src/app/models/user/user.model';
import { downloadFile } from 'src/shared/utils';

@Component({
  selector: 'app-manage-users-menu',
  imports: [IonList, IonItem, IonLabel, IonIcon, TranslateModule],
  templateUrl: './manage-users-menu.component.html',
  providers: [ModalController],
})
export class ManageUsersMenuComponent {
  @Input() users: User[] = [];
  @Input() userRoles: Item[] = [];
  @Input() userCountries: Item[] = [];

  @Output() readonly user = new EventEmitter<User>();

  constructor(private modalController: ModalController) {}

  public exportUsers() {
    const fileName = 'ibf-users.csv';

    downloadFile(fileName, this.usersToCsv(), 'text/csv');
  }

  usersToCsv() {
    const header = [
      'email',
      'firstName',
      'middleName',
      'lastName',
      'userRole',
      'whatsappNumber',
      'countryCodesISO3',
      'disasterTypes',
    ].join(',');
    const rows = this.users.map(
      ({
        email,
        firstName,
        middleName,
        lastName,
        userRole,
        whatsappNumber,
        countryCodesISO3,
        disasterTypes,
      }) =>
        [
          email,
          firstName,
          middleName,
          lastName,
          userRole,
          whatsappNumber,
          countryCodesISO3.join(':'),
          disasterTypes.join(':'),
        ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  public async inviteUser() {
    const modal = await this.modalController.create({
      component: InviteUserFormComponent,
      componentProps: {
        userRoles: this.userRoles,
        userCountries: this.userCountries,
        user: {
          emit: async (user: User) => {
            if (user) {
              // pass user to users table
              this.user.emit(user);
              // close modal
              await modal.dismiss();
            }
          },
        },
      },
      mode: 'ios',
    });

    await modal.present();
  }
}
