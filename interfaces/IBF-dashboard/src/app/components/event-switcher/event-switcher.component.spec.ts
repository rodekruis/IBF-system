import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { EventSwitcherComponent } from 'src/app/components/event-switcher/event-switcher.component';

describe('EventSwitcherComponent', () => {
  let component: EventSwitcherComponent;
  let fixture: ComponentFixture<EventSwitcherComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({ 'arrow-forward': arrowForward, 'arrow-back': arrowBack });

    TestBed.configureTestingModule({
      declarations: [EventSwitcherComponent],
      imports: [IonicModule, RouterModule.forRoot([])],
      providers: [
        provideIonicAngular(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSwitcherComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
