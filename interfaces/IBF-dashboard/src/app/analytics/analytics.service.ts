import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { SeverityLevel } from 'src/app/analytics/severity-level.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  applicationInsights: ApplicationInsights;
  isApplicationInsightsEnabled: boolean;
  properties: object = {};

  constructor() {
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

    this.setEnvironmentProperties();
    this.isApplicationInsightsEnabled = true;
    this.applicationInsights.loadAppInsights();
  }

  setEnvironmentProperties(): void {
    this.properties = {
      configuration: environment.configuration,
      version: environment.ibfSystemVersion,
      apiUrl: environment.apiUrl,
    };
  }

  logPageView(name?: string): void {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackPageView({
        name,
        properties: this.properties,
      });
    } else {
      console.log('analyticsService logPageView', name);
    }
  }

  logError(error: any, severityLevel?: SeverityLevel): void {
    this.displayOnConsole(error, severityLevel);
  }

  logEvent(name: string, properties?: { [key: string]: any }): void {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackEvent(
        { name },
        Object.assign({}, this.properties, properties),
      );
    } else {
      console.log('analyticsService logEvent', name, properties);
    }
  }

  logException(exception: Error, severityLevel?: SeverityLevel) {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackException({
        exception,
        severityLevel,
      });
    } else {
      this.displayOnConsole(exception, severityLevel);
    }
  }

  logTrace(message: string, properties?: { [key: string]: any }) {
    if (this.isApplicationInsightsEnabled) {
      this.applicationInsights.trackTrace(
        { message },
        Object.assign({}, this.properties, properties),
      );
    } else {
      console.log('analyticsService logTrace', message, properties);
    }
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
