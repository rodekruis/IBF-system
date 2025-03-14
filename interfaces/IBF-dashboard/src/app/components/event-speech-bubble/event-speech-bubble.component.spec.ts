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
import { MOCK_EVENT_STATE } from 'src/app/mocks/event-state.mock';

describe('EventSpeechBubbleComponent', () => {
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
    component.forecastSource = { label: 'Test Source', url: 'http://test.com' };
    component.adminAreaLabelPlural = 'Districts';
    component.areas = MOCK_ALERT_AREAS;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open set trigger popover when openSetTriggerPopover is called', async () => {
    // Act
    await component.openSetTriggerPopover();

    // Assert - Using jasmine.objectContaining to match partial object
    expect(popoverControllerSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        component: jasmine.any(Function),
        componentProps: jasmine.objectContaining({
          eventName: component.event.eventName,
          forecastSource: component.forecastSource,
          adminAreaLabelPlural: component.adminAreaLabelPlural,
          areas: component.areas,
        }),
        showBackdrop: true,
      }),
    );
  });
});
