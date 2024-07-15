import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { EventSwitcherComponent } from './event-switcher.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('EventSwitcherComponent', () => {
  let component: EventSwitcherComponent;
  let fixture: ComponentFixture<EventSwitcherComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EventSwitcherComponent],
        imports: [IonicModule, RouterTestingModule],
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EventSwitcherComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
