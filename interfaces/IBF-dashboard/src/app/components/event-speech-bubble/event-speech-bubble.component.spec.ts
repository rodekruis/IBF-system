import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { EventSpeechBubbleComponent } from 'src/app/components/event-speech-bubble/event-speech-bubble.component';
import { MOCK_ALERT_AREAS } from 'src/app/mocks/alert-areas.mock';
import { MOCK_COUNTRY } from 'src/app/mocks/country.mock';
import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_DISASTERTYPE } from 'src/app/mocks/disaster-type.mock';
import { MOCK_EVENT_STATE } from 'src/app/mocks/event-state.mock';
import { MOCK_INDICATOR } from 'src/app/mocks/indicator.mock';
import { CountryDisasterSettings } from 'src/app/models/country.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';

describe('EventSpeechBubbleComponent', () => {
  let component: EventSpeechBubbleComponent;
  let fixture: ComponentFixture<EventSpeechBubbleComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let placeCodeService: jasmine.SpyObj<PlaceCodeService>;
  let eventService: jasmine.SpyObj<EventService>;
  let adminLevelService: jasmine.SpyObj<AdminLevelService>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAuthSubscription',
    ]);

    authService.getAuthSubscription.and.returnValue(of(null));

    placeCodeService = jasmine.createSpyObj<PlaceCodeService>(
      'PlaceCodeService',
      ['getPlaceCodeHoverSubscription', 'setPlaceCode'],
    );

    placeCodeService.getPlaceCodeHoverSubscription.and.returnValue(of(null));

    eventService = jasmine.createSpyObj<EventService>('EventService', [], {
      state: { event: null, events: [] },
    });

    adminLevelService = jasmine.createSpyObj<AdminLevelService>(
      'AdminLevelService',
      ['zoomInAdminLevel'],
    );

    popoverController = jasmine.createSpyObj<PopoverController>(
      'PopoverController',
      ['create'],
    );

    popoverController.create.and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine
        .createSpy('onDidDismiss')
        .and.resolveTo({ data: null }),
    } as unknown as HTMLIonPopoverElement);

    TestBed.configureTestingModule({
      declarations: [EventSpeechBubbleComponent],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PlaceCodeService, useValue: placeCodeService },
        { provide: EventService, useValue: eventService },
        { provide: AdminLevelService, useValue: adminLevelService },
        { provide: PopoverController, useValue: popoverController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSpeechBubbleComponent);

    component = fixture.componentInstance;

    component.event = MOCK_EVENT_STATE.event;

    component.countryDisasterSettings = new CountryDisasterSettings();

    component.countryDisasterSettings.forecastSource = {
      label: 'Test Source',
      url: 'http://test.com',
    };

    component.countryDisasterSettings.eapLink =
      MOCK_COUNTRYDISASTERSETTINGS.eapLink;

    component.adminAreaLabelPlural = MOCK_COUNTRY.adminRegionLabels['2'].plural;

    component.areas = MOCK_ALERT_AREAS;

    component.mainExposureIndicatorNumberFormat =
      MOCK_INDICATOR.numberFormatMap;

    component.countryCodeISO3 = MOCK_COUNTRY.countryCodeISO3;

    component.disasterType = MOCK_DISASTERTYPE;

    // Spy on the hasSetTriggerPermission method
    spyOn(component, 'hasSetTriggerPermission').and.callFake(
      () => component.userRole === UserRole.LocalAdmin,
    );

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasSetTriggerPermission', () => {
    it('return true for right userRole', () => {
      component.userRole = UserRole.LocalAdmin;

      const result = component.hasSetTriggerPermission();

      expect(result).toBeTrue();
    });

    it('return false for wrong userRole', () => {
      component.userRole = UserRole.Operator;

      const result = component.hasSetTriggerPermission();

      expect(result).toBeFalse();
    });
  });

  describe('openSetTriggerPopover', () => {
    it('should open set trigger popover when openSetTriggerPopover is called', async () => {
      // Arrange
      component.userRole = UserRole.LocalAdmin;

      // Act
      await component.openSetTriggerPopover();

      // Assert - Using jasmine.objectContaining to match partial object
      expect(popoverController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          component: jasmine.any(Function),
          componentProps: jasmine.objectContaining({
            forecastSource: component.countryDisasterSettings.forecastSource,
            eapLink: component.countryDisasterSettings.eapLink,
            adminAreaLabelPlural: component.adminAreaLabelPlural,
            areas: component.areas,
            mainExposureIndicatorNumberFormat:
              component.mainExposureIndicatorNumberFormat,
            hasSetTriggerPermission: component.hasSetTriggerPermission(),
            countryCodeISO3: component.countryCodeISO3,
            disasterType: component.disasterType.disasterType,
            eventName: component.event.eventName,
          }),
          showBackdrop: true,
        }),
      );
    });

    it('should open no-access set trigger popover when openSetTriggerPopover is called without right userRole', async () => {
      // Arrange
      component.userRole = UserRole.Operator;

      // Act
      await component.openSetTriggerPopover();

      // Assert - Using jasmine.objectContaining to match partial object
      expect(popoverController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          component: jasmine.any(Function),
          componentProps: jasmine.objectContaining({
            forecastSource: component.countryDisasterSettings.forecastSource,
            eapLink: component.countryDisasterSettings.eapLink,
            adminAreaLabelPlural: component.adminAreaLabelPlural,
            areas: component.areas,
            mainExposureIndicatorNumberFormat:
              component.mainExposureIndicatorNumberFormat,
            hasSetTriggerPermission: component.hasSetTriggerPermission(),
            countryCodeISO3: component.countryCodeISO3,
            disasterType: component.disasterType.disasterType,
          }),
          showBackdrop: true,
        }),
      );
    });
  });
});
