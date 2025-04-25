import { Injectable } from '@angular/core';
import {
  ApplicationInsights,
  ITelemetryItem,
} from '@microsoft/applicationinsights-web';
import { SeverityLevel } from 'src/app/analytics/severity-level.model';
import { DEBUG_LOG } from 'src/app/config';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private log = DEBUG_LOG ? console.log : () => undefined;

  applicationInsights: ApplicationInsights;
  isApplicationInsightsEnabled: boolean;
  private country: Country;

  constructor(private countryService: CountryService) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    if (
      !environment.applicationInsightsInstrumentationKey ||
      !environment.applicationInsightsUrl
    ) {
      return;
    }

    this.applicationInsights = new ApplicationInsights({
      config: {
        connectionString: `InstrumentationKey=${environment.applicationInsightsInstrumentationKey};IngestionEndpoint=${environment.applicationInsightsUrl}`,
        instrumentationKey: environment.applicationInsightsInstrumentationKey,
        enableAutoRouteTracking: true,
      },
    });

    this.isApplicationInsightsEnabled = true;
    this.applicationInsights.loadAppInsights();
    this.applicationInsights.addTelemetryInitializer(this.telemetryInitializer);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  telemetryInitializer = (item: ITelemetryItem): void => {
    Object.assign(item.data, {
      configuration: environment.configuration,
      version: environment.ibfSystemVersion,
      apiUrl: environment.apiUrl,
      referrer: document.referrer,
      country: this.country ? this.country.countryCodeISO3 : null,
    });
  };

  logPageView(name?: string): void {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackPageView({ name });
    } else {
      this.log('analyticsService logPageView', name);
    }
  }

  logError(error: Error, severityLevel?: SeverityLevel): void {
    this.displayOnConsole(error, severityLevel);
  }

  logEvent(
    name: string,
    properties?: Record<string, boolean | number | string>,
  ): void {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackEvent({ name }, properties);
    } else {
      this.log('analyticsService logEvent', name, properties);
    }
  }

  logException(exception: Error, severityLevel?: SeverityLevel) {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackException({ exception, severityLevel });
    } else {
      this.displayOnConsole(exception, severityLevel);
    }
  }

  logTrace(
    message: string,
    properties?: Record<string, boolean | number | string>,
  ) {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackTrace({ message }, properties);
    } else {
      this.log('analyticsService logTrace', message, properties);
    }
  }

  private displayOnConsole(
    error: Error,
    severityLevel: SeverityLevel = SeverityLevel.Error,
  ) {
    switch (severityLevel) {
      case SeverityLevel.Critical:
      case SeverityLevel.Error:
        console.error(error);
        break;
      case SeverityLevel.Warning:
        console.warn(error);
        break;
      case SeverityLevel.Information:
        console.log(error);
        break;
    }
  }
}
