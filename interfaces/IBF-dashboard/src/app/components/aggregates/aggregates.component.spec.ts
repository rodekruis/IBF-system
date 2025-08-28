/* eslint-disable @typescript-eslint/no-explicit-any */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { of } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AggregatesComponent } from 'src/app/components/aggregates/aggregates.component';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { MOCK_COUNTRY } from 'src/app/mocks/country.mock';
import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_DISASTERTYPE } from 'src/app/mocks/disaster-type.mock';
import { MOCK_EVENT_STATE } from 'src/app/mocks/event-state.mock';
import { MOCK_INDICATOR } from 'src/app/mocks/indicator.mock';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { MapViewService } from 'src/app/services/map-view.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AdminLevelType } from 'src/app/types/admin-level';
import { Indicator } from 'src/app/types/indicator-group';
import { MapView } from 'src/app/types/map-view';

const placeCode: PlaceCode = {
  countryCodeISO3: 'KEN',
  placeCode: 'KE0090400198',
  placeCodeName: 'Guba',
  placeCodeParent: {
    countryCodeISO3: 'KEN',
    placeCode: 'KE009040',
    placeCodeName: 'Banissa',
    placeCodeParentName: 'Mandera',
    adminLevel: 2,
  },
  placeCodeParentName: 'Banissa',
  adminLevel: 3,
};

describe('AggregatesComponent', () => {
  let component: AggregatesComponent;
  let fixture: ComponentFixture<AggregatesComponent>;
  let countryService: jasmine.SpyObj<CountryService>;
  let disasterTypeService: jasmine.SpyObj<DisasterTypeService>;
  let aggregatesService: jasmine.SpyObj<AggregatesService>;
  let placeCodeService: jasmine.SpyObj<PlaceCodeService>;
  let eventService: jasmine.SpyObj<EventService>;
  let adminLevelService: jasmine.SpyObj<AdminLevelService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let mapViewService: jasmine.SpyObj<MapViewService>;
  let popoverPresentSpy: jasmine.Spy;

  beforeEach(waitForAsync(async () => {
    addIcons({ 'information-circle-outline': informationCircleOutline });

    countryService = jasmine.createSpyObj<CountryService>('CountryService', [
      'getCountrySubscription',
    ]);

    countryService.getCountrySubscription.and.returnValue(of(MOCK_COUNTRY));

    disasterTypeService = jasmine.createSpyObj<DisasterTypeService>(
      'DisasterTypeService',
      ['getDisasterTypeSubscription', 'getCountryDisasterTypeSettings'],
    );

    disasterTypeService.getDisasterTypeSubscription.and.returnValue(
      of(MOCK_DISASTERTYPE),
    );

    disasterTypeService.getCountryDisasterTypeSettings.and.returnValue(
      MOCK_COUNTRYDISASTERSETTINGS,
    );

    aggregatesService = jasmine.createSpyObj<AggregatesService>(
      'AggregatesService',
      ['getIndicators'],
    );

    aggregatesService.getIndicators.and.returnValue(of([MOCK_INDICATOR]));

    placeCodeService = jasmine.createSpyObj<PlaceCodeService>(
      'PlaceCodeService',
      ['getPlaceCodeSubscription', 'getPlaceCodeHoverSubscription'],
    );

    placeCodeService.getPlaceCodeSubscription.and.returnValue(of(null));

    placeCodeService.getPlaceCodeHoverSubscription.and.returnValue(of(null));

    eventService = jasmine.createSpyObj<EventService>('EventService', [
      'getInitialEventStateSubscription',
      'getManualEventStateSubscription',
    ]);

    eventService.getInitialEventStateSubscription.and.returnValue(of(null));

    eventService.getManualEventStateSubscription.and.returnValue(of(null));

    adminLevelService = jasmine.createSpyObj<AdminLevelService>(
      'AdminLevelService',
      ['getAdminLevelType'],
    );

    adminLevelService.getAdminLevelType.and.returnValue(AdminLevelType.higher);

    popoverController = jasmine.createSpyObj<PopoverController>(
      'PopoverController',
      ['create'],
    );

    popoverPresentSpy = jasmine.createSpy('present').and.resolveTo();

    popoverController.create.and.resolveTo({
      present: popoverPresentSpy,
    } as unknown as HTMLIonPopoverElement);

    translateService = jasmine.createSpyObj<TranslateService>(
      'TranslateService',
      ['instant'],
    );

    translateService.instant.and.callFake((key: string) => {
      switch (key) {
        case 'aggregates-component.predicted':
          return 'Predicted';
        case 'aggregates-component.national-view':
          return 'National View';
        case 'aggregates-component.plural-suffix':
          return '(s)';
        default:
          return key;
      }
    });

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logEvent'],
    );

    mapViewService = jasmine.createSpyObj<MapViewService>('MapViewService', [
      'getAggregatesMapViewSubscription',
    ]);

    await TestBed.configureTestingModule({
      declarations: [AggregatesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: CountryService, useValue: countryService },
        { provide: DisasterTypeService, useValue: disasterTypeService },
        { provide: AggregatesService, useValue: aggregatesService },
        { provide: PlaceCodeService, useValue: placeCodeService },
        { provide: EventService, useValue: eventService },
        { provide: AdminLevelService, useValue: adminLevelService },
        { provide: PopoverController, useValue: popoverController },
        { provide: TranslateService, useValue: translateService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: MapViewService, useValue: mapViewService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregatesComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();

    component.disasterType = MOCK_DISASTERTYPE;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getAggregatesHeader', () => {
    it('should return expected header in National View', () => {
      const mapView = MapView.national;

      component.placeCodeHover = null;

      component.eventState = MOCK_EVENT_STATE;

      component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;

      component.disasterType = MOCK_DISASTERTYPE;

      const expected = {
        headerLabel: 'National View',
        subHeaderLabel: '2 Predicted Flood(s)',
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in National View while hovering over map area', () => {
      const mapView = MapView.national;

      component.placeCodeHover = placeCode; // this is set when hovering on map area

      component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;

      component.disasterType = MOCK_DISASTERTYPE;

      const expected = {
        headerLabel: placeCode.placeCodeName, // 'Guba'
        subHeaderLabel: 'Predicted Flood',
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in Event View', () => {
      const mapView = MapView.event;

      component.placeCodeHover = null;

      component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;

      component.disasterType = MOCK_DISASTERTYPE;

      component.eventState = MOCK_EVENT_STATE;

      const mockNrAlertAreas = 5;
      const mockAdminAreaLabel = 'Subcounties';

      // spying this method, which uses a global from aggregates.service
      spyOn(component as any, 'getAreaCount').and.returnValue(mockNrAlertAreas);

      // spying this method because it uses this.country, which is private
      spyOn(component as any, 'getAdminAreaLabel').and.returnValue(
        mockAdminAreaLabel,
      );

      const expected = {
        headerLabel: MOCK_EVENT_STATE.event.eventName,
        subHeaderLabel: `${mockNrAlertAreas.toString()} exposed ${mockAdminAreaLabel}`,
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in Event View while hovering over map area', () => {
      const mapView = MapView.event;

      component.placeCodeHover = placeCode; // this is set when hovering on map area

      component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;

      component.disasterType = MOCK_DISASTERTYPE;

      const expected = {
        headerLabel: placeCode.placeCodeName, // 'Guba'
        subHeaderLabel: '',
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in Admin-area View', () => {
      const mapView = MapView.adminArea2;

      component.placeCode = placeCode; // Admin-area View implies placeCode is set

      component.placeCodeHover = null;

      const mockNrAlertAreas = 3;
      const mockAdminAreaLabel = 'Wards';

      // spying this method, which uses a global from aggregates.service
      spyOn(component as any, 'getAreaCount').and.returnValue(mockNrAlertAreas);

      // spying this method because it uses this.country, which is private
      spyOn(component as any, 'getAdminAreaLabel').and.returnValue(
        mockAdminAreaLabel,
      );

      const expected = {
        headerLabel: placeCode.placeCodeName, // 'Guba'
        subHeaderLabel: `${mockNrAlertAreas.toString()} exposed ${mockAdminAreaLabel}`,
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in Admin-area View while hovering over map area', () => {
      const mapView = MapView.adminArea2;

      component.placeCode = placeCode; // Admin-area View implies placeCode is set

      component.placeCodeHover = placeCode;

      const expected = { headerLabel: 'Guba', subHeaderLabel: '' };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });
  });

  describe('moreInfo', () => {
    it('should create popover and log analytics event', async () => {
      // Arrange
      const indicator: Indicator = MOCK_INDICATOR;

      component.eventState = MOCK_EVENT_STATE;

      spyOn(component as any, 'getPopoverText').and.returnValue('');

      // Act
      await component.moreInfo(indicator);

      // Assert
      expect(popoverController.create).toHaveBeenCalledWith({
        component: LayerControlInfoPopoverComponent,
        animated: true,
        cssClass: 'ibf-popover ibf-popover-normal',
        translucent: true,
        showBackdrop: true,
        componentProps: { layer: { label: indicator.label, description: '' } },
      });

      expect(popoverPresentSpy).toHaveBeenCalledWith();

      expect(analyticsService.logEvent).toHaveBeenCalledWith(
        AnalyticsEvent.aggregateInformation,
        {
          indicator: indicator.name,
          page: AnalyticsPage.dashboard,
          isActiveTrigger: true,
          component: component.constructor.name,
        },
      );
    });
  });
});
