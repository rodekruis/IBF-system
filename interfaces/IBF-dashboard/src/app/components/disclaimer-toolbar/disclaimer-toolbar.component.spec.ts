import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DisclaimerToolbarComponent } from './disclaimer-toolbar.component';

describe('DisclaimerToolbarComponent', () => {
  let component: DisclaimerToolbarComponent;
  let fixture: ComponentFixture<DisclaimerToolbarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DisclaimerToolbarComponent],
        imports: [IonicModule],
      }).compileComponents();

      fixture = TestBed.createComponent(DisclaimerToolbarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
