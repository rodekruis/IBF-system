import { Component, OnDestroy } from '@angular/core';
import {
  CheckboxCustomEvent,
  IonCheckbox,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService, UserResponse } from 'src/app/auth/auth.service';
import { TOAST_DURATION, TOAST_POSITION } from 'src/app/config';
import { Country, DisasterType } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { CountryService } from 'src/app/services/country.service';
import { UserService } from 'src/app/services/user.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

@Component({
  selector: 'app-manage-preferences',
  imports: [
    IonCheckbox,
    IonList,
    IonItem,
    IonListHeader,
    IonLabel,
    TranslateModule,
  ],
  templateUrl: './manage-preferences.component.html',
})
export class ManagePreferencesComponent implements OnDestroy {
  private authSubscription: Subscription;
  public user: null | User = null;
  private countries: Country[] = [];
  public disasterTypes: DisasterType[] = [];

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private userService: UserService,
    private translateService: TranslateService,
    private toastController: ToastController,
  ) {
    this.authSubscription = this.authService
      .getAuthSubscription()
      .subscribe(this.onAuthChange);

    this.countryService.getAllCountries().subscribe((countries) => {
      this.countries = countries;
      this.updateDisasterTypeList();
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  private onAuthChange = (user: null | User) => {
    this.user = user;
    this.updateDisasterTypeList();
  };

  private updateDisasterTypeList() {
    this.disasterTypes = Array.from(
      new Map(
        this.user.countries
          .flatMap(
            (countryCode) =>
              this.countries.find(
                (country) => country.countryCodeISO3 === countryCode,
              )?.disasterTypes || [],
          )
          .map((disasterType) => [disasterType.disasterType, disasterType]),
      ).values(),
    );
  }

  public toggleDisasterType(event: CheckboxCustomEvent<DisasterTypeKey>) {
    const disasterTypeKey = event.detail.value;
    const checked = event.detail.checked;
    const disasterTypes = checked
      ? [...this.user.disasterTypes, disasterTypeKey]
      : this.user.disasterTypes.filter(
          (userDisasterTypeKey) => userDisasterTypeKey !== disasterTypeKey,
        );
    const presentToastError = this.translateService.instant(
      'common.error.present-toast',
    ) as string;

    this.userService.updateUser({ disasterTypes }, this.user.userId).subscribe({
      next: (userResponse: UserResponse) => {
        this.authService.setUser(userResponse);

        const updateMessageSuccess = this.translateService.instant(
          'manage.preferences.saved',
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
