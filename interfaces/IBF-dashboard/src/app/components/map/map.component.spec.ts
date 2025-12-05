import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@bluehalo/ngx-leaflet-markercluster';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { of } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { MapComponent } from 'src/app/components/map/map.component';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { MapLegendService } from 'src/app/services/map-legend.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { PointMarkerService } from 'src/app/services/point-marker.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel } from 'src/app/types/admin-level';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let timelineService: jasmine.SpyObj<TimelineService>;
  let mapService: jasmine.SpyObj<MapService>;
  let placeCodeService: jasmine.SpyObj<PlaceCodeService>;
  let eventService: jasmine.SpyObj<EventService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let pointMarkerService: jasmine.SpyObj<PointMarkerService>;
  let mapLegendService: jasmine.SpyObj<MapLegendService>;
  let adminLevelService: jasmine.SpyObj<AdminLevelService>;

  beforeEach(waitForAsync(() => {
    addIcons({
      'chevron-up-outline': chevronUpOutline,
      'chevron-down-outline': chevronDownOutline,
    });

    timelineService = jasmine.createSpyObj<TimelineService>('TimelineService', [
      'getTimelineStateSubscription',
      'setTimelineState',
    ]);

    timelineService.getTimelineStateSubscription.and.returnValue(of(null));

    mapService = jasmine.createSpyObj<MapService>(
      'MapService',
      [
        'getLayerSubscription',
        'setAdminRegionMouseOverStyle',
        'setOutlineLayerStyle',
        'setAdminRegionStyle',
      ],
      { adminLevel: AdminLevel.adminLevel1 },
    );

    mapService.getLayerSubscription.and.returnValue(of(null));

    placeCodeService = jasmine.createSpyObj<PlaceCodeService>(
      'PlaceCodeService',
      [
        'getPlaceCodeSubscription',
        'setPlaceCode',
        'setPlaceCodeHover',
        'clearPlaceCodeHover',
      ],
    );

    placeCodeService.getPlaceCodeSubscription.and.returnValue(of(null));

    eventService = jasmine.createSpyObj<EventService>('EventService', [
      'getInitialEventStateSubscription',
      'getManualEventStateSubscription',
      'switchEvent',
    ]);

    eventService.getInitialEventStateSubscription.and.returnValue(of(null));

    eventService.getManualEventStateSubscription.and.returnValue(of(null));

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logEvent'],
    );

    pointMarkerService = jasmine.createSpyObj<PointMarkerService>(
      'PointMarkerService',
      [
        'createMarkerStation',
        'createMarkerRedCrossBranch',
        'createMarkerTyphoonTrack',
        'createMarkerDam',
        'createMarkerWaterpoint',
        'createMarkerHealthSite',
        'createMarkerEvacuationCenter',
        'createMarkerSchool',
        'createMarkerCommunityNotification',
        'createMarkerRiverGauges',
        'createMarkerDefault',
      ],
    );

    adminLevelService = jasmine.createSpyObj<AdminLevelService>(
      'AdminLevelService',
      ['zoomInAdminLevel'],
    );

    mapLegendService = jasmine.createSpyObj<MapLegendService>(
      'MapLegendService',
      [
        'getLegendTitle',
        'getPointLegendString',
        'getAlertLevelPointLegendString',
        'getShapeLegendString',
        'getWmsLegendString',
      ],
    );

    TestBed.configureTestingModule({
      declarations: [MapComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        IonicModule,
        LeafletModule,
        LeafletMarkerClusterModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: TimelineService, useValue: timelineService },
        { provide: MapService, useValue: mapService },
        { provide: PlaceCodeService, useValue: placeCodeService },
        { provide: EventService, useValue: eventService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: PointMarkerService, useValue: pointMarkerService },
        { provide: MapLegendService, useValue: mapLegendService },
        { provide: AdminLevelService, useValue: adminLevelService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
