import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DisclaimerToolbarComponent } from 'src/app/components/disclaimer-toolbar/disclaimer-toolbar.component';

describe('DisclaimerToolbarComponent', () => {
  let component: DisclaimerToolbarComponent;
  let fixture: ComponentFixture<DisclaimerToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule, DisclaimerToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisclaimerToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
