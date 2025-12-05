import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonRow,
  PopoverController,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ManageUsersMenuComponent } from 'src/app/components/manage-users-menu/manage-users-menu.component';
import { TypeaheadComponent } from 'src/app/components/typeahead/typeahead.component';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import {
  USER_ROLE_LABEL,
  USER_ROLE_RANK,
  UserRole,
} from 'src/app/models/user/user-role.enum';
import { CountryService } from 'src/app/services/country.service';
import { UserService } from 'src/app/services/user.service';
import { UpdateUserResponse } from 'src/app/types/api';

@Component({
  selector: 'app-manage-users',
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonInput,
    IonList,
    IonItem,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './manage-users.component.html',
  providers: [PopoverController],
})
export class ManageUsersComponent implements OnDestroy {
  private authSubscription: Subscription;
  public user: null | User = null;
  public users: User[] = [];

  public filterText = '';
  public sortColumn: keyof User | null = 'countryCodesISO3';
  public sortAsc = true;
  public page = 1;
  public min = Math.min;
  public pageSize = 10;
  public message: string;
  public columns: { key: keyof User; label: string }[] = [
    { key: 'firstName', label: 'manage.account.name' },
    { key: 'email', label: 'manage.account.email' },
    { key: 'userRole', label: 'manage.account.role' },
    { key: 'countryCodesISO3', label: 'manage.users.countries' },
  ];

  public countries: Country[] = [];
  public countryName: Record<string, string> = {};
  public USER_ROLE_LABEL = USER_ROLE_LABEL;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private countryService: CountryService,
    private translateService: TranslateService,
    private toastController: ToastController,
    private popoverController: PopoverController,
  ) {
    this.message = String(this.translateService.instant('common.loading'));

    this.userService.users.subscribe({
      next: (users: User[]) => {
        this.updateUsers(users);

        this.message = String(
          this.translateService.instant('manage.users.not-found'),
        );
      },
      error: () => {
        this.message = String(
          this.translateService.instant('common.error.unknown'),
        );
      },
    });

    this.authSubscription = this.authService
      .getAuthSubscription()
      .subscribe(this.onAuthChange);

    this.countryService.getAllCountries().subscribe((countries) => {
      this.countries = countries;

      countries.forEach(({ countryCodeISO3, countryName }) => {
        this.countryName[countryCodeISO3] = countryName;
      });
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  private onAuthChange = (user: null | User) => {
    this.user = user;
    this.updateUsers(this.users);
  };

  private updateUsers(users: User[]) {
    this.users = users.filter(({ userId }) => userId !== this.user?.userId);
  }

  public getUserName = this.userService.getUserName;

  get filteredUsers() {
    if (!this.filterText) return this.users;

    return this.users.filter((user) => {
      const countryNames = user.countryCodesISO3.map(
        (countryCodeISO3) => this.countryName[countryCodeISO3],
      );

      return [
        user.firstName,
        user.middleName,
        user.lastName,
        user.email,
        user.userRole,
        ...user.countryCodesISO3,
        ...countryNames,
      ]
        .join(' ')
        .toLowerCase()
        .includes(this.filterText.toLowerCase());
    });
  }

  get sortedUsers() {
    if (!this.sortColumn) return this.filteredUsers;

    return [...this.filteredUsers].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];

      if (aVal == null) return 1;

      if (bVal == null) return -1;

      if (Array.isArray(aVal) && Array.isArray(bVal)) {
        if (aVal.length < bVal.length) return this.sortAsc ? -1 : 1;

        if (aVal.length > bVal.length) return this.sortAsc ? 1 : -1;
      }

      if (this.sortColumn === 'userRole') {
        const aRoleIndex = USER_ROLE_RANK[aVal as UserRole];
        const bRoleIndex = USER_ROLE_RANK[bVal as UserRole];

        if (aRoleIndex < bRoleIndex) return this.sortAsc ? -1 : 1;

        if (aRoleIndex > bRoleIndex) return this.sortAsc ? 1 : -1;
      }

      if (aVal < bVal) return this.sortAsc ? -1 : 1;

      if (aVal > bVal) return this.sortAsc ? 1 : -1;

      return 0;
    });
  }

  get pagedUsers() {
    const start = (this.page - 1) * this.pageSize;

    return this.sortedUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.sortedUsers.length / this.pageSize);
  }

  get userRoles() {
    const userRoles = Object.values(UserRole).sort(
      (a, b) => USER_ROLE_RANK[b] - USER_ROLE_RANK[a],
    );

    if (this.user?.userRole === UserRole.Admin) {
      return userRoles;
    }

    return userRoles.filter((role) => role !== UserRole.Admin);
  }

  get userCountries() {
    return this.user?.countryCodesISO3;
  }

  setSort(column: keyof User) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;

      if (this.sortAsc) {
        this.sortColumn = null;
      }
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.page = 1;
  }

  getSortIcon(sortColumn: keyof User) {
    if (this.sortColumn !== sortColumn) return 'swap-vertical';

    return this.sortAsc ? 'arrow-up' : 'arrow-down';
  }

  onUserRoleChange(userRole: UserRole, user: User) {
    const presentToastError = String(
      this.translateService.instant('common.error.present-toast'),
    );

    this.userService.updateUser({ userRole }, user.userId).subscribe({
      next: (updateUserResponse: UpdateUserResponse) => {
        user.userRole = updateUserResponse.user.userRole;

        const updateMessageSuccess = String(
          this.translateService.instant('manage.users.role-changed', {
            userName: this.getUserName(user),
            userRole: USER_ROLE_LABEL[userRole],
          }),
        );

        this.presentToast(updateMessageSuccess).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
      error: () => {
        const updateMessageFailure = String(
          this.translateService.instant('common.error.unknown'),
        );

        this.presentToast(updateMessageFailure).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
    });
  }

  onCountriesChange(
    countryCodesISO3: Country['countryCodeISO3'][],
    user: User,
  ) {
    const presentToastError = String(
      this.translateService.instant('common.error.present-toast'),
    );

    this.userService.updateUser({ countryCodesISO3 }, user.userId).subscribe({
      next: (updateUserResponse: UpdateUserResponse) => {
        user.userRole = updateUserResponse.user.userRole;
        user.countryCodesISO3 = countryCodesISO3;

        const updateMessageSuccess = String(
          this.translateService.instant('manage.users.countries-changed', {
            userName: this.getUserName(user),
            countryCount: countryCodesISO3.length,
          }),
        );

        this.presentToast(updateMessageSuccess).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
      error: () => {
        const updateMessageFailure = String(
          this.translateService.instant('common.error.unknown'),
        );

        this.presentToast(updateMessageFailure).catch((error: unknown) => {
          console.error(`${presentToastError}: ${JSON.stringify(error)}`);
        });
      },
    });
  }

  public async showUserRoles(event: Event, user: User) {
    const popover = await this.popoverController.create({
      component: TypeaheadComponent,
      componentProps: {
        items: this.userRoles.map((userRole) => ({
          label: USER_ROLE_LABEL[userRole] || userRole,
          value: userRole,
          disabled: !this.userRoles.includes(user.userRole),
        })),
        selectedItems: user.userRole,
        selectionChange: {
          emit: (userRole: UserRole) => {
            this.onUserRoleChange(userRole, user);
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

  public async showUserCountries(event: Event, user: User) {
    const popover = await this.popoverController.create({
      component: TypeaheadComponent,
      componentProps: {
        enableSearch: true,
        items: this.userCountries.map((countryCodeISO3) => ({
          label: this.countryName[countryCodeISO3] || countryCodeISO3,
          value: countryCodeISO3,
          disabled: !this.userRoles.includes(user.userRole),
        })),
        selectedItems: user.countryCodesISO3,
        selectionChange: {
          emit: (countries: string[]) => {
            this.onCountriesChange(countries, user);
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

  public async showManageUsersMenu(event: Event) {
    const manageUsersMenu = await this.popoverController.create({
      component: ManageUsersMenuComponent,
      componentProps: {
        users: this.users,
        userRoles: this.userRoles.map((userRole) => ({
          label: USER_ROLE_LABEL[userRole] || userRole,
          value: userRole,
        })),
        userCountries: this.userCountries.map((countryCodeISO3) => ({
          label: this.countryName[countryCodeISO3] || countryCodeISO3,
          value: countryCodeISO3,
        })),
        user: {
          emit: (user: User) => {
            if (user) {
              // insert new user into users table
              this.updateUsers([...this.users, user]);
            }
          },
        },
      },
      event,
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      dismissOnSelect: true,
      showBackdrop: false,
    });

    await manageUsersMenu.present();
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
