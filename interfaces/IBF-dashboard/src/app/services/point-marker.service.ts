import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { divIcon, icon, IconOptions, LatLng, Marker, marker } from 'leaflet';
import { DateTime } from 'luxon';
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
  School,
  Station,
  TyphoonTrackPoint,
  Waterpoint,
  WaterpointInternal,
} from 'src/app/models/poi.model';
import { AnalyticsEvent, AnalyticsPage } from '../analytics/analytics.enum';
import { AnalyticsService } from '../analytics/analytics.service';
import { CommunityNotificationPopupComponent } from '../components/community-notification-popup/community-notification-popup.component';
import {
  CountryDisasterSettings,
  EapAlertClasses,
} from '../models/country.model';
import { LeadTime } from '../types/lead-time';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class PointMarkerService {
  private TYPHOON_TRACK_NORMAL_POINT_SIZE = 15;
  private TYPHOON_TRACK_LATEST_POINT_SIZE = 26;

  constructor(
    private eventService: EventService,
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
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

  private renderPopUpHTML(popupData): HTMLElement {
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

  private onMapMarkerClick = (analyticsEvent) => (): void => {
    this.analyticsService.logEvent(analyticsEvent, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });
  };

  public createMarkerStation(
    markerProperties: Station,
    markerLatLng: LatLng,
    countryDisasterSettings: CountryDisasterSettings,
    activeLeadTime: LeadTime,
  ): Marker {
    const markerTitle = markerProperties.stationName;
    let markerIcon: IconOptions;
    let className: string;

    markerIcon = {
      ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
      iconUrl: `assets/markers/glofas-station-${markerProperties.eapAlertClass}-trigger.svg`,
      iconRetinaUrl: `assets/markers/glofas-station-${markerProperties.eapAlertClass}-trigger.svg`,
    };
    className = `trigger-popup-${markerProperties.eapAlertClass}`;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon ? icon(markerIcon) : divIcon(),
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(
      this.createMarkerStationPopup(
        markerProperties,
        countryDisasterSettings,
        activeLeadTime,
      ),
      {
        minWidth: 300,
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
    lastModelRunDate: string,
    closestPointToTyphoon: number,
  ): Marker {
    const markerDateTime = DateTime.fromISO(
      markerProperties.timestampOfTrackpoint,
    );
    const modelDateTime = DateTime.fromISO(lastModelRunDate);
    const isLatest = markerDateTime.equals(
      DateTime.fromMillis(closestPointToTyphoon),
    );

    let className = 'typhoon-track-icon';
    let passed = '';

    if (markerDateTime > modelDateTime) {
      className += ' typhoon-track-icon-future';
    } else {
      passed = '(Passed)';
      if (isLatest) {
        className += ' typhoon-track-icon-latest';
      } else {
        className += ' typhoon-track-icon-past';
      }
    }

    if (markerProperties.firstLandfall || markerProperties.closestToLand) {
      className += ' typhoon-track-icon-firstLandfall';
    }

    const dateAndTime = DateTime.fromISO(
      markerProperties.timestampOfTrackpoint,
    ).toFormat('ccc, dd LLLL, HH:mm');

    const category = this.translate.instant(
      'map-popups.PHL.typhoon.category.' + markerProperties.category,
    );

    const coordinate = this.formatAsCoordinate(markerLatLng);

    const markerInstance = marker(markerLatLng, {
      title: dateAndTime,
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
        dateAndTime,
        category,
        coordinate,
        passed,
      ),
      {
        minWidth: 300,
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
        markerProperties.exposed
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
        markerProperties.exposed
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
        markerProperties.exposed
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

    const addComma = (n) => Math.round(n).toLocaleString('en-US');

    const forecastBar = `
    <div style="border-radius:10px;height:20px;background-color:#d4d3d2; width: 100%">
        <div style="border-radius:10px 0 0 10px; border-right: dashed; border-right-width: thin;height:20px;width: 80%">
          <div style="
            border-radius:10px;
            height:20px;
            line-height:20px;
            background-color:${eapStatusColor};
            color:${eapStatusColorText};
            text-align:center;
            white-space: nowrap;
            min-width: 15%;
            width:${triggerWidth}%">${addComma(forecastValue)}</div>
        </div>
      </div>
    `;

    const infoPopup = `
      <div style="background-color:${eapStatusColor}; color:${eapStatusColorText}; padding: 5px; margin-bottom: 5px"> \ \
        <strong>${title}
      </strong> \
      </div> \
      <div style="margin-left:5px; margin-right: 5px"> \
        <div style="margin-bottom:5px"> \
      ${subtitle} \
      </div> \
      ${forecastBar}
    <div style="height:20px;background-color:none; border-right: dashed; border-right-width: thin; float: left; width: 80%; padding-top: 5px; margin-bottom:10px; text-align: right; padding-right: 2px;"> \
      ${thresholdName}:</div> \
   \
  <div style="height:20px;background-color:none; margin-left: 81%; text-align: left; width: 20%; padding-top: 5px; margin-bottom:10px"><strong>${addComma(
    thresholdValue,
  )}</strong></div></div> \
</div> \
  <div style="background-color: ${eapStatusColor}; color:${eapStatusColorText}; padding: 10px; text-align: center; text-transform:uppercase"> \
    <strong>${eapStatusText}</strong> \
  </div>`;

    return infoPopup;
  }

  private createMarkerStationPopup(
    markerProperties: Station,
    countryDisasterSettings: CountryDisasterSettings,
    activeLeadTime: LeadTime,
  ): string {
    const eapAlertClasses =
      countryDisasterSettings?.eapAlertClasses || ({} as EapAlertClasses);
    const eapAlertClass = eapAlertClasses[markerProperties.eapAlertClass];

    const eapStatusText = eapAlertClass?.label;
    const eapStatusColor = `var(--ion-color-${eapAlertClass?.color})`;
    const eapStatusColorText = `var(--ion-color-${eapAlertClass?.color}-contrast)`;

    const title =
      markerProperties.stationCode +
      ' STATION: ' +
      markerProperties.stationName;

    const leadTimes = countryDisasterSettings?.activeLeadTimes;
    const lastAvailableLeadTime: LeadTime = leadTimes[leadTimes.length - 1];
    const leadTime = activeLeadTime || lastAvailableLeadTime;

    const subtitle = `${leadTime} forecast of <span title="The amount of water moving down a river at a given time and place" style="text-decoration: underline; text-decoration-style: dotted; cursor:default">river discharge</span> in m<sup>3</sup>/s \
          ${
            markerProperties.forecastReturnPeriod
              ? `<br>(Corresponding to a return period of <strong>${markerProperties.forecastReturnPeriod}</strong> years)`
              : ''
          }`;

    const thresholdName = 'Trigger activation threshold';
    const stationInfoPopup = this.createThresholdPopup(
      eapStatusColorText,
      title,
      eapStatusColor,
      eapStatusText,
      markerProperties.forecastLevel,
      markerProperties.triggerLevel,
      subtitle,
      thresholdName,
    );
    return stationInfoPopup;
  }

  private createMarkerTyphoonTrackPopup(
    dateAndTime: string,
    category: string,
    coordinate: string,
    passed: string,
  ): string {
    const bg = 'var(--ion-color-ibf-primary)';
    const color = 'var(--ion-color-ibf-white)';

    const trackpointInfoPopup = `
      <div style="border: 2px solid ${bg}">
        <div style="background: ${bg}; color: ${color}; padding: 8px; font-size: 14px;">
          <strong>TYPHOON TRACK <span>${passed}</span></strong>
        </div>
        <div style="padding: 8px; display:flex; flex-direction: row; justify-content: space-between;">
        <div>
          <div style="margin-bottom: 8px;">Date and time: <strong>${dateAndTime}</strong></div>
          <div>Category (ECWMF): <strong>${category}</strong></div>
        </div>
        <div>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.8211 16.1286L26.8028 16.0965C26.6224 15.7859 26.3267 15.5591 25.98 15.4655C25.6334 15.372 25.2638 15.4192 24.9518 15.5969L22.8259 16.8254C23.0049 15.3864 22.7191 13.9279 22.0103 12.6631C21.9984 12.6347 21.9847 12.6071 21.9691 12.5806L21.9554 12.5622L17.9831 5.67707C17.894 5.52297 17.7755 5.38791 17.6343 5.27963C17.4931 5.17135 17.3319 5.09196 17.16 5.04598C16.9882 5.00001 16.8089 4.98836 16.6325 5.0117C16.4562 5.03504 16.2861 5.09291 16.1321 5.182L16.0954 5.20034C15.786 5.38181 15.5605 5.67798 15.4679 6.02465C15.3753 6.37131 15.423 6.74054 15.6006 7.05227L16.8239 9.17467C15.3552 8.99448 13.8677 9.29695 12.5859 10.0365L12.5355 10.064L5.67673 14.0291C5.5227 14.1182 5.38772 14.2368 5.27949 14.3781C5.17126 14.5194 5.09191 14.6806 5.04596 14.8526C5.00001 15.0245 4.98837 15.2039 5.01169 15.3803C5.03502 15.5568 5.09286 15.727 5.18191 15.8811L5.20023 15.9132C5.28928 16.0673 5.40779 16.2023 5.54901 16.3106C5.69022 16.4189 5.85137 16.4983 6.02325 16.5442C6.19513 16.5902 6.37438 16.6019 6.55076 16.5785C6.72714 16.5552 6.8972 16.4973 7.05122 16.4082L9.18169 15.1797C9.00449 16.6386 9.3017 18.1158 10.0293 19.3924C10.0319 19.4039 10.0366 19.4147 10.043 19.4245L10.0522 19.4383L14.0245 26.3234C14.2046 26.6344 14.5006 26.8612 14.8477 26.954C15.1947 27.0468 15.5643 26.9981 15.8755 26.8185L15.9122 26.8002C16.2224 26.6195 16.4486 26.3233 16.5413 25.9763C16.634 25.6293 16.5857 25.2597 16.407 24.9482L15.1837 22.8258C16.5925 23.0018 18.0208 22.7291 19.2659 22.0466C19.3212 22.0227 19.3748 21.9951 19.4263 21.964L19.44 21.9549L26.3263 17.9805C26.6357 17.7991 26.8611 17.5029 26.9538 17.1562C27.0464 16.8096 26.9987 16.4403 26.8211 16.1286ZM12.4347 18.0631C12.4301 18.0585 12.4301 18.0539 12.4255 18.0493C11.8868 17.1079 11.7406 15.9921 12.0185 14.9436C12.2963 13.8951 12.9759 12.9983 13.91 12.4476C13.9191 12.4431 13.9329 12.4339 13.942 12.4293C13.9512 12.4247 13.9558 12.4201 13.9649 12.4156C14.9062 11.8793 16.0204 11.7349 17.0671 12.0137C18.1138 12.2924 19.0089 12.9719 19.5591 13.9054C19.5637 13.9145 19.5729 13.9283 19.5775 13.9374C19.5821 13.9466 19.5866 13.9512 19.5912 13.9604C20.1288 14.9084 20.2701 16.0306 19.9843 17.0825C19.6985 18.1343 19.0088 19.0305 18.0655 19.5758C18.0609 19.5804 18.0564 19.5804 18.0518 19.5849C17.1047 20.1261 15.9819 20.2698 14.9291 19.9845C13.8764 19.6993 12.9794 19.0084 12.4347 18.0631Z" fill="${bg}"/>
          </svg>
        </div>
        </div>
        <div style="background: ${bg}; color: ${color}; padding: 8px; text-align: right;">
          <strong>Coordinate: ${coordinate}</strong>
        </div>
      </div>
    `;
    return trackpointInfoPopup;
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
}
