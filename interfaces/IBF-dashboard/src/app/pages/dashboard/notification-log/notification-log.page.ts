import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { first } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {
  Item,
  TypeAheadComponent,
} from 'src/app/components/type-ahead/type-ahead.component';
import { Country } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

export type NotificationLogPeriod = 'all' | 'month' | 'quarter' | 'year';
export type NotificationChannel = 'email' | 'whatsapp';

export interface NotificationLog {
  notificationLogId: string;
  channel: NotificationChannel;
  recipientCount: number;
  countryCodeISO3: string;
  disasterType: DisasterTypeKey;
  eventNames: string[];
  createdAt: string;
}

export interface NotificationLogPageResponse {
  logs: NotificationLog[];
  total: number;
}

export interface NotificationLogMetrics {
  events: number;
  users: number;
  email: number;
  whatsapp: number;
}

export interface NotificationLogFilters {
  period: NotificationLogPeriod;
  countryCodesISO3: string[];
  disasterTypes: DisasterTypeKey[];
}

const PAGE_SIZE = 10;

@Component({
  selector: 'app-notification-log',
  templateUrl: './notification-log.page.html',
  standalone: false,
})
export class NotificationLogPage implements OnInit {
  public periods: NotificationLogPeriod[] = ['month', 'quarter', 'year', 'all'];
  public period: NotificationLogPeriod = 'year';
  public countryOptions: { countryCodeISO3: string; countryName: string }[] =
    [];

  public countryCodesISO3: string[] = [];
  public disasterTypeOptions: {
    disasterType: DisasterTypeKey;
    label: string;
  }[] = [];

  public disasterTypes: DisasterTypeKey[] = [];

  public metrics: NotificationLogMetrics;
  public logs: NotificationLog[] = [];
  public total = 0;
  public page = 1;
  public loading = true;

  private userCountryCodesISO3: string[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private countryService: CountryService,
    private popoverController: PopoverController,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.authService
      .getAuthSubscription()
      .pipe(first())
      .subscribe((user) => {
        this.userCountryCodesISO3 = user?.countryCodesISO3 ?? [];
      });

    this.countryService.getCountries().subscribe((countries) => {
      this.onGetCountries(countries);
    });

    this.onFilterChange();
  }

  public onFilterChange() {
    this.page = 1;
    this.loading = true;

    this.apiService.getNotificationLogs(this.filters, true).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
      },
      error: () => {
        this.metrics = null;
      },
    });

    this.getLogsPage();
  }

  public async showPeriodSelect(event: Event) {
    await this.presentTypeAhead(event, {
      items: this.periods.map((period) => ({
        label: this.periodLabel(period),
        value: period,
      })),
      selectedItems: this.period,
      onSelectionChange: (selection) => {
        this.period = selection as NotificationLogPeriod;
        this.onFilterChange();
      },
    });
  }

  public async showCountrySelect(event: Event) {
    await this.presentTypeAhead(event, {
      items: this.countryOptions.map(({ countryCodeISO3, countryName }) => ({
        label: countryName,
        value: countryCodeISO3,
      })),
      selectedItems: [...this.countryCodesISO3],
      onSelectionChange: (selection) => {
        this.countryCodesISO3 = selection as string[];
        this.onFilterChange();
      },
    });
  }

  public async showHazardSelect(event: Event) {
    await this.presentTypeAhead(event, {
      items: this.disasterTypeOptions.map(({ disasterType, label }) => ({
        label,
        value: disasterType,
      })),
      selectedItems: [...this.disasterTypes],
      onSelectionChange: (selection) => {
        this.disasterTypes = selection as DisasterTypeKey[];
        this.onFilterChange();
      },
    });
  }

  public periodLabel(period: NotificationLogPeriod): string {
    return this.translate.instant(
      `notification-log-page.filter.period-options.${period}`,
    ) as string;
  }

  public get selectedCountriesLabel(): string {
    if (this.countryCodesISO3.length === 0) {
      return this.translate.instant(
        'notification-log-page.filter.all-countries',
      ) as string;
    }

    return this.countryCodesISO3
      .map((countryCodeISO3) => this.countryName(countryCodeISO3))
      .join(', ');
  }

  public get selectedHazardsLabel(): string {
    if (this.disasterTypes.length === 0) {
      return this.translate.instant(
        'notification-log-page.filter.all-hazards',
      ) as string;
    }

    return this.disasterTypes
      .map((disasterType) => this.disasterTypeLabel(disasterType))
      .join(', ');
  }

  public goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.loading = true;
    this.getLogsPage();
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / PAGE_SIZE));
  }

  public timeAgo({ createdAt }: NotificationLog): string {
    return formatDistanceToNow(parseISO(createdAt), { addSuffix: true });
  }

  public eventNamesLabel({ eventNames }: NotificationLog): string {
    return (
      eventNames.join(', ') ||
      (this.translate.instant('notification-log-page.no-events') as string)
    );
  }

  public countryName(countryCodeISO3: string): string {
    return (
      this.countryOptions.find(
        (country) => country.countryCodeISO3 === countryCodeISO3,
      )?.countryName ?? countryCodeISO3
    );
  }

  public disasterTypeLabel(disasterType: DisasterTypeKey): string {
    return (
      this.disasterTypeOptions.find(
        (option) => option.disasterType === disasterType,
      )?.label ?? disasterType
    );
  }

  private get filters(): NotificationLogFilters {
    return {
      period: this.period,
      countryCodesISO3: this.countryCodesISO3,
      disasterTypes: this.disasterTypes,
    };
  }

  private getLogsPage() {
    this.apiService
      .getNotificationLogs(this.filters, false, this.page)
      .subscribe({
        next: ({ logs, total }: NotificationLogPageResponse) => {
          this.logs = logs;
          this.total = total;
          this.loading = false;
        },
        error: () => {
          this.logs = [];
          this.total = 0;
          this.loading = false;
        },
      });
  }

  private async presentTypeAhead(
    event: Event,
    props: {
      items: Item[];
      selectedItems: string | string[];
      onSelectionChange: (selection: string | string[]) => void;
    },
  ) {
    const target = (event.target as HTMLElement).closest('ion-item');
    const popover = await this.popoverController.create({
      component: TypeAheadComponent,
      componentProps: {
        enableSearch: props.items.length > 8, // size 8 based on height of type-ahead
        items: props.items,
        selectedItems: props.selectedItems,
        selectionChange: { emit: props.onSelectionChange },
        selectionCancel: {
          emit: () => {
            void popover.dismiss();
          },
        },
      },
      event: Object.assign({}, event, { target }),
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      size: 'cover',
      dismissOnSelect: false,
      showBackdrop: false,
    });

    await popover.present();
  }

  private onGetCountries = (countries: Country[]) => {
    // scope filter options to the user's own countries, same as the API
    const userCountries = countries.filter(({ countryCodeISO3 }) =>
      this.userCountryCodesISO3.includes(countryCodeISO3),
    );

    this.countryOptions = userCountries.map(
      ({ countryCodeISO3, countryName }) => ({ countryCodeISO3, countryName }),
    );

    const disasterTypeOptions = new Map<DisasterTypeKey, string>();

    for (const country of userCountries) {
      for (const { disasterType, label } of country.disasterTypes) {
        disasterTypeOptions.set(disasterType, label);
      }
    }

    this.disasterTypeOptions = [...disasterTypeOptions.entries()]
      .map(([disasterType, label]) => ({ disasterType, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };
}
