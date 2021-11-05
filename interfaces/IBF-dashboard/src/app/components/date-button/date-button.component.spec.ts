import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DateButtonComponent } from './date-button.component';

describe('DateButtonComponent', () => {
  let component: DateButtonComponent;
  let fixture: ComponentFixture<DateButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DateButtonComponent],
        imports: [IonicModule, HttpClientTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(DateButtonComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
