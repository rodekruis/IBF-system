import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
} from '@angular/core';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import {
  divIcon,
  icon,
  IconOptions,
  LatLng,
  Marker,
  marker,
  Popup,
} from 'leaflet';
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
  LEAFLET_MARKER_ICON_OPTIONS_SCHOOL,
  LEAFLET_MARKER_ICON_OPTIONS_SCHOOL_EXPOSED,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT_EXPOSED,
} from 'src/app/config';
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
} from 'src/app/models/poi.model';
import { EventService } from 'src/app/services/event.service';
import {
  AlertLevel,
  eapAlertClassToAlertLevel,
} from 'src/app/types/alert-level';
import { Event } from 'src/app/types/event';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';

@Injectable({ providedIn: 'root' })
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
    communityNotification: CommunityNotification,
    latLng: LatLng,
  ) {
    if (communityNotification.dismissed) {
      return;
    }

    const markerInstance = marker(latLng, {
      title: communityNotification.nameVillage,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_COMMUNITY_NOTIFICATION),
      alt: 'Community notifications',
    });

    markerInstance.bindPopup(this.renderPopUpHTML(communityNotification), {
      minWidth: 220,
    });

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.communityNotification),
    );

    return markerInstance;
  }

  private renderPopUpHTML(
    communityNotification: CommunityNotification,
  ): HTMLElement {
    const popup = document.createElement('popup-component');
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      CommunityNotificationPopupComponent,
    );
    const popupComponentRef = factory.create(this.injector, [], popup);

    this.applicationRef.attachView(popupComponentRef.hostView);
    popupComponentRef.instance.markerProperties = communityNotification;

    return popup;
  }

  private formatAsCoordinate(latLng: LatLng) {
    const lat = `${Math.abs(latLng.lat).toFixed(4)}° ${
      latLng.lat > 0 ? 'N' : 'S'
    }`;
    const lng = `${Math.abs(latLng.lng).toFixed(4)}° ${
      latLng.lng > 0 ? 'E' : 'W'
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
    station: Station,
    latLng: LatLng,
    events: Event[],
  ): Marker {
    const { stationName, stationCode, dynamicData } = station;
    const event = events.find(
      ({ eventName }) => eventName === stationCode || eventName === stationName, // NOTE: this assumes events to be defined per station, and eventName=stationCode or stationName
    );
    // This reflects to take the trigger leadTime and not the earlier warning leadTime, in case of warning-to-trigger scenario
    const eventLeadTime = event?.firstTriggerLeadTime ?? event?.firstLeadTime;
    const eapAlertClassKey = dynamicData?.eapAlertClass ?? 'no';
    const alertLevel = eapAlertClassToAlertLevel[eapAlertClassKey];
    const markerClassName = `glofas-station glofas-station-${alertLevel}`;
    const markerIcon: IconOptions = {
      ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
      iconUrl: `assets/markers/glofas-station-${alertLevel}.svg`,
      iconRetinaUrl: `assets/markers/glofas-station-${alertLevel}.svg`,
      className: markerClassName,
    };
    const popupClassName = `glofas-station-popup glofas-station-popup-${alertLevel}`;
    const markerInstance = marker(latLng, {
      title: stationName,
      icon: markerIcon
        ? icon(markerIcon)
        : divIcon({ className: markerClassName }),
      zIndexOffset: 700,
    });

    markerInstance.bindPopup(
      this.createMarkerStationPopup(station, eventLeadTime),
      { minWidth: 350, className: popupClassName },
    );

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.glofasStation),
    );

    return markerInstance;
  }

  public createMarkerTyphoonTrack(
    {
      timestampOfTrackpoint,
      firstLandfall,
      closestToLand,
      category,
    }: TyphoonTrackPoint,
    latLng: LatLng,
    lastUploadDateString: string,
    closestPointToTyphoon: Date,
  ): Marker {
    const markerDateTime = parseISO(timestampOfTrackpoint);
    const lastUploadDate = parseISO(lastUploadDateString);
    const isLatest = isEqual(markerDateTime, closestPointToTyphoon);
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

    if (firstLandfall || closestToLand) {
      className += ' typhoon-track-icon-firstLandfall';
    }

    const markerInstance = marker(latLng, {
      title: format(markerDateTime, titleFormat),
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
        timestampOfTrackpoint,
        category,
        latLng,
        !isAfter(markerDateTime, lastUploadDate),
      ),
      { minWidth: 350, className: 'typhoon-track-popup' },
    );

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.typhoonTrack),
    );

    return markerInstance;
  }

  public createMarkerRedCrossBranch(
    redCrossBranch: RedCrossBranch,
    latLng: LatLng,
  ): Marker {
    const markerInstance = marker(latLng, {
      title: redCrossBranch.branchName,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH),
      alt: 'Red Cross branches',
    });

    markerInstance.bindPopup(this.createMarkerRedCrossPopup(redCrossBranch));

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.redCrossBranch),
    );

    return markerInstance;
  }

  public createMarkerDam(damSite: DamSite, latLng: LatLng): Marker {
    const markerInstance = marker(latLng, {
      title: damSite.damName,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_DAM),
    });

    markerInstance.bindPopup(this.createMarkerDamPopup(damSite));
    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.dam));

    return markerInstance;
  }

  public createMarkerHealthSite(
    healthSite: HealthSite,
    latLng: LatLng,
  ): Marker {
    const { name, dynamicData } = healthSite;
    const markerInstance = marker(latLng, {
      title: name,
      icon: icon(
        dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT,
      ),
    });

    if (markerInstance) {
      markerInstance.bindPopup(this.createHealthSitePopup(healthSite));

      markerInstance.on(
        'click',
        this.onMapMarkerClick(AnalyticsEvent.healthSite),
      );
    }

    return markerInstance;
  }

  public createMarkerWaterpoint(
    waterpoint: Waterpoint,
    latLng: LatLng,
  ): Marker {
    const { fid, dynamicData } = waterpoint;
    const markerInstance = marker(latLng, {
      title: fid,
      icon: icon(
        dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
      ),
    });

    markerInstance.bindPopup(
      this.createMarkerWaterpointPopup(waterpoint, latLng),
    );

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.waterPoint),
    );

    return markerInstance;
  }

  public createMarkerEvacuationCenter(
    evacuationCenter: EvacuationCenter,
    latLng: LatLng,
  ): Marker {
    const markerInstance = marker(latLng, {
      title: evacuationCenter.evacuationCenterName,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER),
    });

    markerInstance.bindPopup(
      this.createMarkerEvacuationCenterPopup(evacuationCenter, latLng),
    );

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.evacuationCenter),
    );

    return markerInstance;
  }

  public createMarkerSchool(school: School, latLng: LatLng): Marker {
    const { name, dynamicData } = school;
    const markerInstance = marker(latLng, {
      title: name,
      icon: icon(
        dynamicData?.exposure
          ? LEAFLET_MARKER_ICON_OPTIONS_SCHOOL_EXPOSED
          : LEAFLET_MARKER_ICON_OPTIONS_SCHOOL,
      ),
    });

    markerInstance.bindPopup(this.createMarkerSchoolPopup(school, latLng));
    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.school));

    return markerInstance;
  }

  public createMarkerRiverGauges(
    riverGauge: RiverGauge,
    latLng: LatLng,
  ): Marker {
    const markerTitle = riverGauge.name;
    const alertLevel =
      riverGauge.dynamicData?.['water-level-alert-level'] ?? AlertLevel.NONE;
    const markerIconFileName = `river-gauge-${alertLevel}`;
    const markerClassName = `river-gauge ${markerIconFileName}`;
    const markerIcon: IconOptions = {
      ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
      iconUrl: `assets/markers/${markerIconFileName}.svg`,
      iconRetinaUrl: `assets/markers/${markerIconFileName}.svg`,
      className: markerClassName,
    };
    const markerInstance = marker(latLng, {
      title: markerTitle,
      icon: markerIcon
        ? icon(markerIcon)
        : divIcon({ className: markerClassName }),
    });
    const popupClassName = `river-gauge-popup ${markerIconFileName}`;

    markerInstance.bindPopup(this.createMarkerRiverGaugePopup(riverGauge), {
      minWidth: 350,
      className: popupClassName,
    });

    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.riverGauge),
    );

    return markerInstance;
  }

  private createMarkerStationPopup(station: Station, eventLeadTime: LeadTime) {
    const lastAvailableLeadTime: LeadTime = LeadTime.day7; // Agreed with pipeline that untriggered station will always show day 7
    const leadTime = eventLeadTime || lastAvailableLeadTime;
    const component = this.componentFactoryResolver
      .resolveComponentFactory(DynamicPointPopupComponent)
      .create(this.injector);

    component.instance.layerName = IbfLayerName.glofasStations;
    component.instance.glofasData = { station, leadTime };
    component.changeDetectorRef.detectChanges();

    return component.location.nativeElement as Popup;
  }

  private createMarkerTyphoonTrackPopup(
    timestamp: string,
    category: string,
    latLng: LatLng,
    passed: boolean,
  ) {
    const component = this.componentFactoryResolver
      .resolveComponentFactory(DynamicPointPopupComponent)
      .create(this.injector);

    component.instance.layerName = IbfLayerName.typhoonTrack;

    component.instance.typhoonTrackPoint = {
      timestamp,
      category,
      markerLatLng: latLng,
      passed,
    };

    component.changeDetectorRef.detectChanges();

    return component.location.nativeElement as Popup;
  }

  private createMarkerRedCrossPopup(markerProperties: RedCrossBranch) {
    const unknown = 'UNKNOWN';

    return `
      <div style="margin-bottom: 5px"><strong>Branch: ${markerProperties.branchName}</strong></div>
      <div style="margin-bottom: 5px">Nr. of volunteers: ${String(markerProperties.numberOfVolunteers ?? unknown)}</div>
      <div style="margin-bottom: 5px">Contact person: ${markerProperties.contactPerson ?? unknown}</div>
      <div style="margin-bottom: 5px">Contact address: ${markerProperties.contactAddress ?? unknown}</div>
      <div style="margin-bottom: 5px">Contact number: ${markerProperties.contactNumber ?? unknown}</div>
    `.trim();
  }

  private createMarkerDamPopup(damSite: DamSite) {
    const damName = damSite.damName ?? '';
    const fullSupplyCapacity =
      damSite.fullSupplyCapacity != null
        ? Math.round(damSite.fullSupplyCapacity).toLocaleString()
        : '';

    return `
      <div style="margin-bottom: 5px">
        <strong>Dam: ${damName}</strong>
      </div>
      <div style="margin-bottom: 5px">
        Full Supply Capacity: ${fullSupplyCapacity} million m<sup>3</sup>
      </div>
    `.trim();
  }

  private createMarkerEvacuationCenterPopup(
    evacuationCenter: EvacuationCenter,
    latLng: LatLng,
  ) {
    return `<div style="margin-bottom: 5px"><strong>Evacuation center: ${
      evacuationCenter.evacuationCenterName
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      latLng,
    )}
    </div>`;
  }

  private createMarkerSchoolPopup(school: School, latLng: LatLng) {
    return `<div style="margin-bottom: 5px"><strong>Name: ${
      school.name
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      latLng,
    )}
    </div>`;
  }

  private createHealthSitePopup(healthSite: HealthSite) {
    const name = healthSite.name ?? '';
    const type = healthSite.type ?? '';

    return `
      <div style="margin-bottom: 5px">
        <strong>Name: ${name}</strong>
      </div>
      <div style="margin-bottom: 5px">
        Type: ${type}
      </div>
    `.trim();
  }

  private createMarkerWaterpointPopup(waterpoint: Waterpoint, latLng: LatLng) {
    return `
      <div style="margin-bottom: 5px"><strong>Name: ${waterpoint.name}</strong></div>
      ${waterpoint.type ? `<div style="margin-bottom: 5px">Type: ${waterpoint.type}</div>` : ''}
      ${waterpoint.report_date ? `<div style="margin-bottom: 5px">Report date: ${waterpoint.report_date}</div>` : ''}
      <div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(latLng)}</div>
    `;
  }

  public createMarkerDefault(latLng: LatLng): Marker {
    const markerInstance = marker(latLng, {
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

    return component.location.nativeElement as Popup;
  }
}
