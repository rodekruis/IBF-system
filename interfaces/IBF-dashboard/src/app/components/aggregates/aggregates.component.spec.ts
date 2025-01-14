/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AggregatesComponent } from 'src/app/components/aggregates/aggregates.component';
import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_DISASTERTYPE } from 'src/app/mocks/disaster-type.mock';
import { MOCK_EVENT_STATE } from 'src/app/mocks/event-state.mock';
import { MockTranslateService } from 'src/app/mocks/mock-translate.service';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { AdminLevelType } from 'src/app/types/admin-level';
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
  let adminLevelService: AdminLevelService;
  let fixture: ComponentFixture<AggregatesComponent>;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [AggregatesComponent],
      imports: [
        IonicModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: AggregatesService },
        { provide: AdminLevelService },
        { provide: TranslateService, useClass: MockTranslateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregatesComponent);
    component = fixture.componentInstance;
    adminLevelService = TestBed.inject(AdminLevelService);
    fixture.detectChanges();
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

      const mockNrTriggeredAreas = 5;
      const mockAdminAreaLabel = 'Subcounties';
      // spying this method, which uses a global from aggregates.service
      spyOn(component as any, 'getAreaCount').and.returnValue(
        mockNrTriggeredAreas,
      );
      // spying this method because it uses this.country, which is private
      spyOn(component as any, 'getAdminAreaLabel').and.returnValue(
        mockAdminAreaLabel,
      );

      const expected = {
        headerLabel: MOCK_EVENT_STATE.event.eventName,
        subHeaderLabel: `${mockNrTriggeredAreas.toString()} exposed ${mockAdminAreaLabel}`,
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
      spyOn(adminLevelService as any, 'getAdminLevelType').and.returnValue(
        AdminLevelType.higher,
      );
      const mockNrTriggeredAreas = 3;
      const mockAdminAreaLabel = 'Wards';
      // spying this method, which uses a global from aggregates.service
      spyOn(component as any, 'getAreaCount').and.returnValue(
        mockNrTriggeredAreas,
      );
      // spying this method because it uses this.country, which is private
      spyOn(component as any, 'getAdminAreaLabel').and.returnValue(
        mockAdminAreaLabel,
      );

      const expected = {
        headerLabel: placeCode.placeCodeName, //'Guba'
        subHeaderLabel: `${mockNrTriggeredAreas.toString()} exposed ${mockAdminAreaLabel}`,
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });

    it('should return expected header in Admin-area View while hovering over map area', () => {
      const mapView = MapView.adminArea2;
      component.placeCode = placeCode; // Admin-area View implies placeCode is set
      component.placeCodeHover = placeCode;

      const expected = {
        headerLabel: 'Guba',
        subHeaderLabel: '',
      };

      expect(component.getAggregatesHeader(mapView)).toEqual(expected);
    });
  });
});
