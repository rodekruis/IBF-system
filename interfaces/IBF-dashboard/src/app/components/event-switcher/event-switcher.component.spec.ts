import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EventSwitcherComponent } from './event-switcher.component';

describe('EventSwitcherComponent', () => {
  let component: EventSwitcherComponent;
  let fixture: ComponentFixture<EventSwitcherComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EventSwitcherComponent],
        imports: [
          IonicModule,
          HttpClientTestingModule,
          RouterTestingModule,
          TranslateModule.forRoot(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EventSwitcherComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
