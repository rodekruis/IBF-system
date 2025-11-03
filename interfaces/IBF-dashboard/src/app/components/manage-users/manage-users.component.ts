import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonRow,
  IonSelect,
  IonSelectOption,
  SelectCustomEvent,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService, UserResponse } from 'src/app/auth/auth.service';
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

@Component({
  selector: 'app-manage-users',
  imports: [
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonInput,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './manage-users.component.html',
})
export class ManageUsersComponent implements OnDestroy {
  private authSubscription: Subscription;
  public user: null | User = null;
  public users: User[] = [];

  public filterText = '';
  public sortColumn: keyof User | null = 'countries';
  public sortAsc = true;
  public page = 1;
  public min = Math.min;
  public pageSize = 10;
  public message: string;
  public columns: { key: keyof User; label: string }[] = [
    { key: 'firstName', label: 'manage.account.name' },
    { key: 'email', label: 'manage.account.email' },
    { key: 'userRole', label: 'manage.account.role' },
    { key: 'countries', label: 'manage.users.countries' },
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
  ) {
    this.message = String(this.translateService.instant('common.loading'));

    this.userService.users.subscribe((users: User[]) => {
      this.updateUsers(users);

      this.message = String(
        this.translateService.instant('manage.users.not-found'),
      );
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
      const countryNames = user.countries.map(
        (country) => this.countryName[country],
      );

      return [
        user.firstName,
        user.middleName,
        user.lastName,
        user.email,
        user.userRole,
        ...user.countries,
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

  get roles() {
    const roles = Object.values(UserRole).reverse();

    if (this.user?.userRole === UserRole.Admin) {
      return roles;
    }

    return roles.filter((role) => role !== UserRole.Admin);
  }

  get userCountries() {
    return this.user?.countries;
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

  setPage(page: number) {
    this.page = page;
  }

  getSortIcon(sortColumn: keyof User) {
    if (this.sortColumn !== sortColumn) return 'swap-vertical';

    return this.sortAsc ? 'arrow-up' : 'arrow-down';
  }

  onRoleChange(event: SelectCustomEvent<UserRole>, user: User) {
    const userRole = event.detail.value;
    const presentToastError = this.translateService.instant(
      'common.error.present-toast',
    ) as string;

    this.userService.updateUser({ userRole }, user.userId).subscribe({
      next: (updateUserResponse: UserResponse) => {
        user.userRole = updateUserResponse.user.userRole;

        const updateMessageSuccess = this.translateService.instant(
          'manage.users.role-changed',
          {
            userName: this.getUserName(user),
            userRole: USER_ROLE_LABEL[userRole],
          },
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

  onCountriesChange(
    event: SelectCustomEvent<Country['countryCodeISO3'][]>,
    user: User,
  ) {
    const countries = event.detail.value;
    const presentToastError = this.translateService.instant(
      'common.error.present-toast',
    ) as string;

    this.userService.updateUser({ countries }, user.userId).subscribe({
      next: (updateUserResponse: UserResponse) => {
        user.userRole = updateUserResponse.user.userRole;
        user.countries = countries;

        const updateMessageSuccess = this.translateService.instant(
          'manage.users.countries-changed',
          { userName: this.getUserName(user), countryCount: countries.length },
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
