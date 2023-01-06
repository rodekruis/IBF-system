import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ScreenOrientationPopoverComponent } from './screen-orientation-popover.component';

describe('ScreenOrientationPopoverComponent', () => {
  let component: ScreenOrientationPopoverComponent;
  let fixture: ComponentFixture<ScreenOrientationPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ScreenOrientationPopoverComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ScreenOrientationPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
