import { Component, Input } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'src/app/models/user/user.model';
import { downloadFile } from 'src/shared/utils';

@Component({
  selector: 'app-manage-users-menu',
  imports: [IonList, IonItem, IonLabel, IonIcon, TranslateModule],
  templateUrl: './manage-users-menu.component.html',
})
export class ManageUsersMenuComponent {
  @Input() users: User[] = [];

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
      'countries',
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
        countries,
        disasterTypes,
      }) =>
        [
          email,
          firstName,
          middleName,
          lastName,
          userRole,
          whatsappNumber,
          countries.join(':'),
          disasterTypes.join(':'),
        ].join(','),
    );

    return [header, ...rows].join('\n');
  }
}
