import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { Country, DisasterType } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { ALERT_LEVEL_RANK, AlertLevel } from 'src/app/types/alert-level';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { Event } from 'src/app/types/event';
import { LastUploadDate } from 'src/app/types/last-upload-date';

interface DisasterStatus {
  alertLevel: AlertLevel;
  imgSrc: string;
  date: string;
  isStale: boolean;
}

type CountryStatus = Record<string, DisasterStatus>;

type StatusData = Record<string, CountryStatus>;

@Component({
  selector: 'app-status-report',
  templateUrl: './status-report.page.html',
  styleUrls: ['./status-report.page.scss'],
  standalone: false,
})
export class StatusReportPage implements OnInit {
  public statusData: StatusData = {};
  public AlertLevel = AlertLevel;

  constructor(
    private apiService: ApiService,
    private countryService: CountryService,
    private eventService: EventService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.countryService.getCountries().subscribe((countries) => {
      this.onGetAllCountries(countries);
    });
  }

  private onGetAllCountries = (countries: Country[]) => {
    for (const country of countries) {
      this.statusData[country.countryCodeISO3] = {};

      const disasterTypes = country.disasterTypes;

      for (const disasterType of disasterTypes) {
        this.statusData[country.countryCodeISO3][disasterType.disasterType] = {
          alertLevel: AlertLevel.NONE,
          imgSrc: '',
          date: '',
          isStale: true,
        };

        this.apiService
          .getLastUploadDate(country.countryCodeISO3, disasterType.disasterType)
          .subscribe((date) => {
            this.onLastUploadDate(date, country.countryCodeISO3, disasterType);
          });
      }
    }
  };

  private onLastUploadDate = (
    lastUploadDate: LastUploadDate,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) => {
    this.statusData[countryCodeISO3][disasterType.disasterType].date =
      lastUploadDate?.timestamp
        ? format(parseISO(lastUploadDate?.timestamp), 'yyyy-MM-dd HH:mm')
        : (this.translate.instant('status-report-page.no-data') as string);

    this.statusData[countryCodeISO3][disasterType.disasterType].isStale =
      lastUploadDate?.timestamp
        ? this.eventService.isLastUploadDateLate(
            parseISO(lastUploadDate.timestamp),
            disasterType,
          )
        : true;

    this.apiService
      .getEvents(countryCodeISO3, disasterType.disasterType)
      .subscribe((events) => {
        this.onGetEvents(events, countryCodeISO3, disasterType.disasterType);
      });
  };

  private onGetEvents = (
    events: Event[],
    countryCodeISO3: string,
    disasterTypeKey: DisasterTypeKey,
  ) => {
    const alertLevel = events.reduce(
      (prev, curr) =>
        ALERT_LEVEL_RANK[curr.alertLevel] < ALERT_LEVEL_RANK[prev]
          ? curr.alertLevel
          : prev,
      AlertLevel.NONE,
    );

    this.statusData[countryCodeISO3][disasterTypeKey].alertLevel = alertLevel;

    this.statusData[countryCodeISO3][disasterTypeKey].imgSrc =
      alertLevel === AlertLevel.TRIGGER
        ? DISASTER_TYPES_SVG_MAP[disasterTypeKey].selectedTriggered
        : DISASTER_TYPES_SVG_MAP[disasterTypeKey].selectedNonTriggered;
  };
}
