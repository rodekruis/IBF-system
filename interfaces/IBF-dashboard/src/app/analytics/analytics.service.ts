import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { SeverityLevel } from 'src/app/analytics/severity-level.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class AnalyticsService {
  appInsights: ApplicationInsights;
  appInsightsEnabled: boolean;

  constructor() {
    if (
      !environment.applicationInsightsInstrumentationKey ||
      !environment.applicationInsightsUrl
    ) {
      return;
    }

    this.appInsights = new ApplicationInsights({
      config: {
        connectionString: `InstrumentationKey=${environment.applicationInsightsInstrumentationKey};IngestionEndpoint=${environment.applicationInsightsUrl}`,
        instrumentationKey: environment.applicationInsightsInstrumentationKey,
        enableAutoRouteTracking: true,
      },
    });

    this.appInsightsEnabled = true;
    this.appInsights.loadAppInsights();
  }

  logPageView(name?: string) {
    this.appInsights.trackPageView({ name });
  }

  logError(error: any, severityLevel?: SeverityLevel) {
    this.displayOnConsole(error, severityLevel);
  }

  logEvent(name: string, properties?: { [key: string]: any }) {
    this.appInsights.trackEvent({ name }, properties);
  }

  logException(exception: Error, severityLevel?: SeverityLevel) {
    if (this.appInsightsEnabled) {
      this.appInsights.trackException({
        exception,
        severityLevel,
      });
    } else {
      this.displayOnConsole(exception, severityLevel);
    }
  }

  logTrace(message: string, properties?: { [key: string]: any }) {
    this.appInsights.trackTrace({ message }, properties);
  }

  private displayOnConsole(
    error: any,
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
