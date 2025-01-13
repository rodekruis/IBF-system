import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AggregatesComponent } from 'src/app/components/aggregates/aggregates.component';
import {
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { LeadTime, LeadTimeUnit } from 'src/app/types/lead-time';
import { MapView } from 'src/app/types/map-view';

const placeCodeHover: PlaceCode = {
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

const MOCK_COUNTRYDISASTERSETTINGS: CountryDisasterSettings = {
  disasterType: DisasterTypeKey.floods,
  adminLevels: [2, 3],
  defaultAdminLevel: 2,
  activeLeadTimes: [
    LeadTime.day0,
    LeadTime.day1,
    LeadTime.day2,
    LeadTime.day3,
    LeadTime.day4,
    LeadTime.day5,
    LeadTime.day6,
    LeadTime.day7,
  ],
  eapLink:
    'https://kenyaredcross-my.sharepoint.com/:w:/g/personal/saado_halima_redcross_or_ke/ETp6Vml__etKk-C2KAqH4XIBrIJmAMT58mqA_iQlCZtuKw?rtime=FJll0Rbn2Ug',
  eapAlertClasses: {
    no: {
      label: 'No action',
      color: 'ibf-no-alert-primary',
      value: 0,
    },
    max: {
      label: 'Trigger issued',
      color: 'ibf-glofas-trigger',
      value: 1,
    },
  },
  isEventBased: true,
  droughtSeasonRegions: null,
  droughtRegions: {},
  showMonthlyEapActions: false,
};

const MOCK_DISASTERTYPE: DisasterType = {
  disasterType: DisasterTypeKey.floods,
  label: 'floods',
  leadTimeUnit: LeadTimeUnit.day,
  minLeadTime: LeadTime.day0,
  maxLeadTime: LeadTime.day7,
  actionsUnit: 'string',
  triggerUnit: 'string',
  activeTrigger: false,
};

describe('AggregatesComponent', () => {
  let component: AggregatesComponent;
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAggregatesHeader MapView.national', () => {
    const mapView = MapView.national;

    component.placeCodeHover = placeCodeHover;
    component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;
    component.disasterType = MOCK_DISASTERTYPE;

    let expected = {
      headerLabel: 'Guba',
      subHeaderLabel: 'aggregates-component.predicted Floods',
    };

    expect(component.getAggregatesHeader(mapView)).toEqual(expected);

    component.placeCodeHover = null;
    component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;
    component.disasterType = MOCK_DISASTERTYPE;

    expected = {
      headerLabel: 'aggregates-component.national-view',
      subHeaderLabel:
        '0 aggregates-component.predicted Floodsaggregates-component.plural-suffix',
    };

    expect(component.getAggregatesHeader(mapView)).toEqual(expected);
  });

  it('getAggregatesHeader MapView.event', () => {
    const mapView = MapView.event;

    component.placeCodeHover = placeCodeHover;
    // component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;
    // component.disasterType = MOCK_DISASTERTYPE;

    const expected = {
      headerLabel: 'Guba',
      subHeaderLabel: '',
    };

    expect(component.getAggregatesHeader(mapView)).toEqual(expected);
  });

  it('getAggregatesHeader MapView.adminArea2', () => {
    const mapView = MapView.adminArea2;

    component.placeCodeHover = placeCodeHover;
    // component.countryDisasterSettings = MOCK_COUNTRYDISASTERSETTINGS;
    // component.disasterType = MOCK_DISASTERTYPE;

    const expected = {
      headerLabel: 'Guba',
      subHeaderLabel: '',
    };

    expect(component.getAggregatesHeader(mapView)).toEqual(expected);
  });
});
