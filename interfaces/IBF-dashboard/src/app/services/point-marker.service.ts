import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
} from '@angular/core';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { divIcon, icon, IconOptions, LatLng, Marker, marker } from 'leaflet';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { CommunityNotificationPopupComponent } from 'src/app/components/community-notification-popup/community-notification-popup.component';
import { DynamicPointPopupComponent } from 'src/app/components/leaflet-popup/dynamic-point-popup/dynamic-point-popup.component';
import {
  LEAFLET_MARKER_ICON_OPTIONS_BASE,
  LEAFLET_MARKER_ICON_OPTIONS_COMMUNITY_NOTIFICATION,
  LEAFLET_MARKER_ICON_OPTIONS_DAM,
  LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER,
  LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT,
  LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_EXPOSED,
  LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH,
  LEAFLET_MARKER_ICON_OPTIONS_RIVER_GAUGE,
  LEAFLET_MARKER_ICON_OPTIONS_SCHOOL,
  LEAFLET_MARKER_ICON_OPTIONS_SCHOOL_EXPOSED,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT_EXPOSED,
} from 'src/app/config';
import {
  CountryDisasterSettings,
  EapAlertClasses,
} from 'src/app/models/country.model';
import {
  CommunityNotification,
  DamSite,
  EvacuationCenter,
  HealthSite,
  RedCrossBranch,
  RiverGauge,
  School,
  Station,
  TyphoonTrackPoint,
  Waterpoint,
  WaterpointInternal,
} from 'src/app/models/poi.model';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';

@Injectable({
  providedIn: 'root',
})
export class PointMarkerService {
  private TYPHOON_TRACK_NORMAL_POINT_SIZE = 15;
  private TYPHOON_TRACK_LATEST_POINT_SIZE = 26;

  constructor(
    private eventService: EventService,
    private analyticsService: AnalyticsService,
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  public createMarkerCommunityNotification(
    markerProperties: CommunityNotification,
    markerLatLng: LatLng,
  ) {
    if (markerProperties.dismissed) {
      return;
    }
    const markerTitle = markerProperties.nameVillage;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_COMMUNITY_NOTIFICATION),
      alt: 'Community notifications',
    });
    markerInstance.bindPopup(this.renderPopUpHTML(markerProperties), {
      minWidth: 220,
    });
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.communityNotification),
    );

    return markerInstance;
  }

  private renderPopUpHTML(popupData: CommunityNotification): HTMLElement {
    const popup = document.createElement('popup-component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      CommunityNotificationPopupComponent,
    );
    const popupComponentRef = factory.create(this.injector, [], popup);
    this.applicationRef.attachView(popupComponentRef.hostView);
    popupComponentRef.instance.markerProperties = popupData;
    return popup;
  }

  private formatAsCoordinate(markerLatLng: LatLng) {
    const lat = `${Math.abs(markerLatLng.lat).toFixed(4)}° ${
      markerLatLng.lat > 0 ? 'N' : 'S'
    }`;
    const lng = `${Math.abs(markerLatLng.lng).toFixed(4)}° ${
      markerLatLng.lng > 0 ? 'E' : 'W'
    }`;
    return `${lat}, ${lng}`;
  }

  private onMapMarkerClick = (analyticsEvent: AnalyticsEvent) => (): void => {
    this.analyticsService.logEvent(analyticsEvent, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });
  };

  public createMarkerStation(
    markerProperties: Station,
    markerLatLng: LatLng,
    countryDisasterSettings: CountryDisasterSettings,
    events: EventSummary[],
  ): Marker {
    const event = events.find(
      (e) =>
        e.eventName === markerProperties.stationCode ||
        e.eventName === markerProperties.stationName, // NOTE: this assumes events to be defined per station, and eventName=stationCode or stationName
    );
    // This reflects to take the trigger leadTime and not the earlier warning leadTime, in case of warning-to-trigger scenario
    const eventLeadTime = (event?.firstTriggerLeadTime ||
      event?.firstLeadTime) as LeadTime;

    const markerTitle = markerProperties.stationName;
    const markerIcon: IconOptions = {
      ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
      iconUrl: `assets/markers/glofas-station-${
        markerProperties.dynamicData?.eapAlertClass || 'no'
      }-trigger.svg`,
      iconRetinaUrl: `assets/markers/glofas-station-${
        markerProperties.dynamicData?.eapAlertClass || 'no'
      }-trigger.svg`,
    };
    const className = `trigger-popup-${
      markerProperties.dynamicData?.eapAlertClass || 'no'
    }`;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon ? icon(markerIcon) : divIcon(),
      alt: 'Glofas stations',
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(
      this.createMarkerStationPopup(
        markerProperties,
        countryDisasterSettings,
        eventLeadTime,
      ),
      {
        minWidth: 350,
        className,
      },
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.glofasStation),
    );

    return markerInstance;
  }

  public createMarkerTyphoonTrack(
    markerProperties: TyphoonTrackPoint,
    markerLatLng: LatLng,
    lastUploadDateString: string,
    closestPointToTyphoon: number,
  ): Marker {
    const markerDateTime = parseISO(markerProperties.timestampOfTrackpoint);
    const lastUploadDate = parseISO(lastUploadDateString);
    const isLatest = isEqual(markerDateTime, new Date(closestPointToTyphoon));
    const titleFormat = 'ccc, dd LLLL, HH:mm';

    let className = 'typhoon-track-icon';

    if (isBefore(lastUploadDate, markerDateTime)) {
      className += ' typhoon-track-icon-future';
    } else {
      if (isLatest) {
        className += ' typhoon-track-icon-latest';
      } else {
        className += ' typhoon-track-icon-past';
      }
    }

    if (markerProperties.firstLandfall || markerProperties.closestToLand) {
      className += ' typhoon-track-icon-firstLandfall';
    }

    const title = format(markerDateTime, titleFormat);

    const markerInstance = marker(markerLatLng, {
      title,
      icon: divIcon({
        className,
        iconSize: isLatest
          ? [
              this.TYPHOON_TRACK_LATEST_POINT_SIZE,
              this.TYPHOON_TRACK_LATEST_POINT_SIZE,
            ]
          : [
              this.TYPHOON_TRACK_NORMAL_POINT_SIZE,
              this.TYPHOON_TRACK_NORMAL_POINT_SIZE,
            ],
      }),
      zIndexOffset: 700,
    });

    markerInstance.bindPopup(
      this.createMarkerTyphoonTrackPopup(
        markerProperties.timestampOfTrackpoint,
        markerProperties.category,
        markerLatLng,
        !isAfter(markerDateTime, lastUploadDate),
      ),
      {
        minWidth: 350,
        className: 'typhoon-track-popup',
      },
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.typhoonTrack),
    );

    return markerInstance;
  }

  public createMarkerRedCrossBranch(
    markerProperties: RedCrossBranch,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.branchName;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH),
      alt: 'Red Cross branches',
    });
    markerInstance.bindPopup(this.createMarkerRedCrossPopup(markerProperties));
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.redCrossBranch),
    );

    return markerInstance;
  }

  public createMarkerDam(
    markerProperties: DamSite,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.damName;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_DAM),
    });
    markerInstance.bindPopup(this.createMarkerDamPopup(markerProperties));
    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.damSite));

    return markerInstance;
  }

  public createMarkerHealthSite(
    markerProperties: HealthSite,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(
        markerProperties.dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT,
      ),
    });

    if (markerInstance) {
      markerInstance.bindPopup(this.createHealthSitePopup(markerProperties));
      markerInstance.on(
        'click',
        this.onMapMarkerClick(AnalyticsEvent.healthSite),
      );
    }

    return markerInstance;
  }

  public createMarkerWaterpoint(
    markerProperties: Waterpoint,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.wpdxId;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT),
    });
    markerInstance.bindPopup(
      this.createMarkerWaterpointPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.waterPoint),
    );

    return markerInstance;
  }

  public createMarkerEvacuationCenter(
    markerProperties: EvacuationCenter,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.evacuationCenterName;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER),
    });
    markerInstance.bindPopup(
      this.createMarkerEvacuationCenterPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.evacuationCenter),
    );

    return markerInstance;
  }

  public createMarkerSchool(
    markerProperties: School,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(
        markerProperties.dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_SCHOOL_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_SCHOOL,
      ),
    });
    markerInstance.bindPopup(
      this.createMarkerSchoolPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.evacuationCenter),
    );

    return markerInstance;
  }

  public createMarkerWaterpointInternal(
    markerProperties: WaterpointInternal,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(
        markerProperties.dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
      ),
    });
    markerInstance.bindPopup(
      this.createMarkerWaterpointInternalPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.evacuationCenter),
    );

    return markerInstance;
  }

  public createMarkerRiverGauges(
    markerProperties: RiverGauge,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle.name,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_RIVER_GAUGE),
    });
    markerInstance.bindPopup(
      this.createMarkerRiverGaugePopup(markerProperties),
      {
        minWidth: 350,
        className: 'river-gauge-popup',
      },
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.redCrossBranch),
    );

    return markerInstance;
  }

  public createThresholdPopup(
    eapStatusColorText: string,
    title: string,
    eapStatusColor: string,
    eapStatusText: string,
    forecastValue: number,
    thresholdValue: number,
    subtitle: string,
    thresholdName: string,
  ): string {
    const difference = forecastValue - thresholdValue;
    const closeMargin = 0.05;
    const tooClose = Math.abs(difference) / thresholdValue < closeMargin;

    const barValue =
      difference === 0 || !tooClose
        ? forecastValue
        : thresholdValue + Math.sign(difference) * thresholdValue * closeMargin;

    const triggerWidth = Math.max(
      Math.min(Math.round((barValue / thresholdValue) * 100), 115),
      0,
    );

    const addComma = (n: number) => Math.round(n).toLocaleString('en-US');

    const headerContent = `<strong>${title}</strong>`;

    const thresholdBar = this.createThresholdBar(
      eapStatusColor,
      eapStatusColorText,
      triggerWidth,
      addComma(forecastValue),
      thresholdName,
      addComma(thresholdValue),
      80,
    );

    const middleContent = `
    <div style="margin-bottom:5px">
      ${subtitle}
    </div>
    ${thresholdBar}
    `;
    const footerContent = `
      <div style="text-align: center">
        <strong>${eapStatusText}</strong>
      </div>
    `;

    return this.createDynamicPointPopup(
      eapStatusColor,
      headerContent,
      middleContent,
      footerContent,
    );
  }

  private createMarkerStationPopup(
    markerProperties: Station,
    countryDisasterSettings: CountryDisasterSettings,
    eventLeadTime: LeadTime,
  ) {
    const lastAvailableLeadTime: LeadTime = LeadTime.day7; // Agreed with pipeline that untriggered station will always show day 7
    const leadTime = eventLeadTime || lastAvailableLeadTime;

    const eapAlertClasses =
      countryDisasterSettings?.eapAlertClasses || ({} as EapAlertClasses);

    const component = this.componentFactoryResolver
      .resolveComponentFactory(DynamicPointPopupComponent)
      .create(this.injector);
    component.instance.layerName = IbfLayerName.glofasStations;
    component.instance.glofasData = {
      station: markerProperties,
      leadTime,
      eapAlertClasses,
    };
    component.changeDetectorRef.detectChanges();
    return component.location.nativeElement;
  }

  private createMarkerTyphoonTrackPopup(
    timestamp: string,
    category: string,
    markerLatLng: LatLng,
    passed: boolean,
  ): string {
    const component = this.componentFactoryResolver
      .resolveComponentFactory(DynamicPointPopupComponent)
      .create(this.injector);
    component.instance.layerName = IbfLayerName.typhoonTrack;
    component.instance.typhoonTrackPoint = {
      timestamp,
      category,
      markerLatLng,
      passed,
    };
    component.changeDetectorRef.detectChanges();
    return component.location.nativeElement;
  }

  private createMarkerRedCrossPopup(markerProperties: RedCrossBranch): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Branch: ' +
      markerProperties.branchName +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Nr. of volunteers: ' +
        (markerProperties.numberOfVolunteers || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact person: ' +
        (markerProperties.contactPerson || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact address: ' +
        (markerProperties.contactAddress || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact number: ' +
        (markerProperties.contactNumber || '') +
        '</div>',
    );
    return branchInfoPopup;
  }

  private createMarkerDamPopup(markerProperties: DamSite): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Dam: ' +
      markerProperties.damName +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Full Supply Capacity: ' +
        (Math.round(markerProperties.fullSupplyCapacity).toLocaleString() ||
          '') +
        ' million m<sup>3</sup></div>',
    );
    return branchInfoPopup;
  }

  private createMarkerEvacuationCenterPopup(
    markerProperties: EvacuationCenter,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>Evacuation center: ${
      markerProperties.evacuationCenterName
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
  }

  private createMarkerSchoolPopup(
    markerProperties: School,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>Name: ${
      markerProperties.name
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
  }

  private createMarkerWaterpointInternalPopup(
    markerProperties: WaterpointInternal,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>Name: ${
      markerProperties.name
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
  }

  private createHealthSitePopup(markerProperties: HealthSite): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Name: ' +
      markerProperties.name +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Type: ' +
        (markerProperties.type || '') +
        '</div>',
    );
    return branchInfoPopup;
  }

  private createMarkerWaterpointPopup(
    markerProperties: Waterpoint,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>ID: ${
      markerProperties.wpdxId
    }</strong></div><div style="margin-bottom: 5px">Waterpoint type: ${
      markerProperties.type || 'unknown'
    }</div><div style="margin-bottom: 5px">Report date: ${
      markerProperties.reportDate
    }</div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
  }

  public createMarkerDefault(markerLatLng: LatLng): Marker {
    const markerInstance = marker(markerLatLng, {
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_BASE),
    });

    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.mapMarker));

    return markerInstance;
  }

  private createMarkerRiverGaugePopup(markerProperties: RiverGauge) {
    const component = this.componentFactoryResolver
      .resolveComponentFactory(DynamicPointPopupComponent)
      .create(this.injector);
    component.instance.layerName = IbfLayerName.gauges;
    component.instance.riverGauge = markerProperties;
    component.changeDetectorRef.detectChanges();
    return component.location.nativeElement;
  }

  private createDynamicPointPopup(
    accentColor: string,
    headerContent: string,
    middleContent: string,
    footerContent: string,
  ): string {
    const contrastColor = 'var(--ion-color-ibf-white)';

    return `
      <div style="background: ${accentColor}; color: ${contrastColor}; padding: 8px; border-radius: 8px 8px 0 0">
        ${headerContent}
      </div>
      <div style="padding: 8px;">
        ${middleContent}
      </div>
      <div style="background: ${contrastColor}; color: ${accentColor}; padding: 0 8px; border-radius: 0 0 8px 8px">
        <div style="border-top: 1px solid var(--ion-color-ibf-grey-light); padding: 8px 0">
          ${footerContent}
        </div>
      </div>

    `;
  }

  private createThresholdBar(
    backgroundColor: string,
    textColor: string,
    barWidth: number,
    barValue: string,
    thresholdDescription: string,
    thresholdValue: string,
    thresholdPosition: number, // width percentage to position threshold on bar
  ): string {
    return `
    <div>
      <div style="border-radius:10px;height:20px;background-color:#d4d3d2; width: 100%">
        <div style="border-radius:10px 0 0 10px; border-right: dashed; border-right-width: thin;height:20px;width: ${thresholdPosition}%">
          <div style="
            border-radius:10px;
            height:20px;
            line-height:20px;
            background-color:${backgroundColor};
            color:${textColor};
            text-align:center;
            white-space: nowrap;
            min-width: 15%;
            width:${barWidth}%">${barValue}
          </div>
        </div>
      </div>
    </div>
    <div style="
      height:20px;
      background-color:none;
      border-right: dashed;
      border-right-width: thin;
      float: left; width: ${thresholdPosition}%;
      padding-top: 5px;
      margin-bottom:10px;
      text-align: right;
      padding-right: 2px">
      ${thresholdDescription}:
    </div>
    <div style="height:20px;background-color:none; margin-left: ${
      thresholdPosition + 1
    }%; text-align: left; width: 20%; padding-top: 5px; margin-bottom:10px">
      <strong>${thresholdValue}</strong>
    </div>
    `;
  }
}
