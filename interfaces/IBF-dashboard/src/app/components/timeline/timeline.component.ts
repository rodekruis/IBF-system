import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnDestroy {
  private countrySubscription: Subscription;

  constructor(
    private countryService: CountryService,
    public timelineService: TimelineService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(async (country: Country) => {
        this.timelineService.loadTimeStepButtons();
        this.timelineService.handleTimeStepButtonClick(
          country.countryForecasts[0],
        );
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }
}
