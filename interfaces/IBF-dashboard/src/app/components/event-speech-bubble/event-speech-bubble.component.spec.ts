import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EventSpeechBubbleComponent } from './event-speech-bubble.component';

describe('EventSpeechBubbleComponent', () => {
  let component: EventSpeechBubbleComponent;
  let fixture: ComponentFixture<EventSpeechBubbleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EventSpeechBubbleComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(EventSpeechBubbleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
