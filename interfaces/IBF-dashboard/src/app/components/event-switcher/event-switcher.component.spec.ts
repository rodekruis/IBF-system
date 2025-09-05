import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { of } from 'rxjs';
import { EventSwitcherComponent } from 'src/app/components/event-switcher/event-switcher.component';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { TimelineState } from 'src/app/types/timeline-state';

describe('EventSwitcherComponent', () => {
  let component: EventSwitcherComponent;
  let fixture: ComponentFixture<EventSwitcherComponent>;
  let disasterTypeService: jasmine.SpyObj<DisasterTypeService>;
  let timelineService: jasmine.SpyObj<TimelineService>;
  let eventService: jasmine.SpyObj<EventService>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'arrow-forward': arrowForward, 'arrow-back': arrowBack });

    disasterTypeService = jasmine.createSpyObj<DisasterTypeService>(
      'DisasterTypeService',
      ['getDisasterTypeSubscription'],
    );

    disasterTypeService.getDisasterTypeSubscription.and.returnValue(of(null));

    timelineService = jasmine.createSpyObj<TimelineService>('TimelineService', [
      'getTimelineStateSubscription',
    ]);

    timelineService.getTimelineStateSubscription.and.returnValue(
      of({ timeStepButtons: [] } as TimelineState),
    );

    eventService = jasmine.createSpyObj<EventService>(
      'EventService',
      ['getInitialEventStateSubscription', 'getManualEventStateSubscription'],
      { state: { event: null, events: [] } },
    );

    eventService.getInitialEventStateSubscription.and.returnValue(of(null));

    eventService.getManualEventStateSubscription.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [EventSwitcherComponent],
      imports: [IonicModule, RouterModule.forRoot([])],
      providers: [
        { provide: DisasterTypeService, useValue: disasterTypeService },
        { provide: TimelineService, useValue: timelineService },
        { provide: EventService, useValue: eventService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSwitcherComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
