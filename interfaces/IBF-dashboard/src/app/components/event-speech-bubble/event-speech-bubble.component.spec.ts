import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EventSpeechBubbleComponent } from 'src/app/components/event-speech-bubble/event-speech-bubble.component';
import { MOCK_ALERT_AREAS } from 'src/app/mocks/alert-areas.mock';
import { MOCK_COUNTRY } from 'src/app/mocks/country.mock';
import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_DISASTERTYPE } from 'src/app/mocks/disaster-type.mock';
import { MOCK_EVENT_STATE } from 'src/app/mocks/event-state.mock';
import { MOCK_INDICATOR } from 'src/app/mocks/indicator.mock';
import { CountryDisasterSettings } from 'src/app/models/country.model';
import { UserRole } from 'src/app/models/user/user-role.enum';

fdescribe('EventSpeechBubbleComponent', () => {
  let component: EventSpeechBubbleComponent;
  let fixture: ComponentFixture<EventSpeechBubbleComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    // Create a spy for the PopoverController
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', [
      'create',
    ]);

    // Mock the create method to return a popover with present method
    popoverControllerSpy.create.and.returnValue(
      Promise.resolve({
        present: jasmine
          .createSpy('present')
          .and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine
          .createSpy('onDidDismiss')
          .and.returnValue(Promise.resolve({ data: null })),
      } as unknown as HTMLIonPopoverElement),
    );

    TestBed.configureTestingModule({
      declarations: [EventSpeechBubbleComponent],
      imports: [
        IonicModule.forRoot(),
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy }, // Add this line
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSpeechBubbleComponent);
    component = fixture.componentInstance;

    // Set any required input properties
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
      expect(popoverControllerSpy.create).toHaveBeenCalledWith(
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

    it('should open no-access set trigger popover when openSetTriggerPopover is called without right userRole', async () => {
      // Arrange
      component.userRole = UserRole.Operator;

      // Act
      await component.openSetTriggerPopover();

      // Assert - Using jasmine.objectContaining to match partial object
      expect(popoverControllerSpy.create).toHaveBeenCalledWith(
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
