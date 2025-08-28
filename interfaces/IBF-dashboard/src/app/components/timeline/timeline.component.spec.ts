import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { TimelineState } from 'src/app/types/timeline-state';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let timelineService: jasmine.SpyObj<TimelineService>;
  let eventService: jasmine.SpyObj<EventService>;
  let placeCodeService: jasmine.SpyObj<PlaceCodeService>;

  beforeEach(waitForAsync(() => {
    timelineService = jasmine.createSpyObj<TimelineService>('TimelineService', [
      'getTimelineStateSubscription',
    ]);

    timelineService.getTimelineStateSubscription.and.returnValue(
      of({ timeStepButtons: [] } as TimelineState),
    );

    eventService = jasmine.createSpyObj<EventService>('EventService', [], {
      state: { event: null, events: [] },
    });

    placeCodeService = jasmine.createSpyObj<PlaceCodeService>(
      'PlaceCodeService',
      ['getPlaceCodeHoverSubscription'],
    );

    placeCodeService.getPlaceCodeHoverSubscription.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [TimelineComponent],
      imports: [IonicModule, TranslateModule.forRoot()],
      providers: [
        { provide: TimelineService, useValue: timelineService },
        { provide: EventService, useValue: eventService },
        { provide: PlaceCodeService, useValue: placeCodeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
