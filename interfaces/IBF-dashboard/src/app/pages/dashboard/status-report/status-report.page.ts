import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CountryService } from '../../../services/country.service';
import { DateTime } from 'luxon';
import { RecentDate } from '../../../types/recent-date';
import { Country, DisasterType } from '../../../models/country.model';
import { DISASTER_TYPES_SVG_MAP } from '../../../config';
import { EventService, EventSummary } from '../../../services/event.service';

@Component({
  selector: 'app-status-report',
  templateUrl: './status-report.page.html',
  styleUrls: ['./status-report.page.scss'],
})
export class StatusReportPage implements OnInit {
  public statusData = {};
  constructor(
    private apiService: ApiService,
    private countryService: CountryService,
    private eventService: EventService,
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
        this.statusData[country.countryCodeISO3][disasterType.disasterType] =
          {};
        this.apiService
          .getRecentDates(country.countryCodeISO3, disasterType.disasterType)
          .subscribe((date) =>
            this.onRecentDates(date, country.countryCodeISO3, disasterType),
          );
      }
    }
  };

  private onRecentDates = (
    date: RecentDate,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) => {
    this.statusData[countryCodeISO3][disasterType.disasterType].date =
      DateTime.fromISO(date.date)?.toFormat('yyyy-MM-dd');
    this.statusData[countryCodeISO3][disasterType.disasterType].isStale =
      this.eventService.isLastModelDateStale(
        DateTime.fromISO(date.date),
        disasterType,
      );

    this.apiService
      .getEventsSummary(countryCodeISO3, disasterType.disasterType)
      .subscribe((events) =>
        this.onGetEvents(events, countryCodeISO3, disasterType),
      );
  };

  private onGetEvents = (
    events: EventSummary[],
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) => {
    this.statusData[countryCodeISO3][disasterType.disasterType].imgSrc =
      events.filter((e: EventSummary) => e.thresholdReached).length > 0
        ? DISASTER_TYPES_SVG_MAP[disasterType.disasterType].selectedTriggered
        : DISASTER_TYPES_SVG_MAP[disasterType.disasterType]
            .selectedNonTriggered;
    console.log('this.statusData: ', this.statusData);
  };
}
