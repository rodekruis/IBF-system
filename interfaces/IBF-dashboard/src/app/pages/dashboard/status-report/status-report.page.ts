import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { format, parseISO } from 'date-fns';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { Country, DisasterType } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  AlertLevel,
  Event,
  EventService,
} from 'src/app/services/event.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { LastUploadDate } from 'src/app/types/last-upload-date';

interface DisasterStatus {
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
  constructor(
    private apiService: ApiService,
    private countryService: CountryService,
    private eventService: EventService,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    this.countryService.getAllCountries().subscribe((countries) => {
      this.onGetAllCountries(countries);
    });
  }

  private onGetAllCountries = (countries: Country[]) => {
    for (const country of countries) {
      this.statusData[country.countryCodeISO3] = {};

      const disasterTypes = country.disasterTypes;

      for (const disasterType of disasterTypes) {
        this.statusData[country.countryCodeISO3][disasterType.disasterType] = {
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
    const isTriggered = events.some(
      ({ alertLevel }) => alertLevel === AlertLevel.TRIGGER,
    );

    this.statusData[countryCodeISO3][disasterTypeKey].imgSrc = isTriggered
      ? DISASTER_TYPES_SVG_MAP[disasterTypeKey].selectedTriggered
      : DISASTER_TYPES_SVG_MAP[disasterTypeKey].selectedNonTriggered;
  };
}
