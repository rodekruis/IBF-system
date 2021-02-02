import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DateButtonComponent } from './date-button.component';

describe('DateButtonComponent', () => {
  let component: DateButtonComponent;
  let fixture: ComponentFixture<DateButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DateButtonComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
