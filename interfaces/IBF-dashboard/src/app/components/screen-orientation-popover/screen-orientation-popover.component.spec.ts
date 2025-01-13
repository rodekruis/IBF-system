import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ScreenOrientationPopoverComponent } from 'src/app/components/screen-orientation-popover/screen-orientation-popover.component';

describe('ScreenOrientationPopoverComponent', () => {
  let component: ScreenOrientationPopoverComponent;
  let fixture: ComponentFixture<ScreenOrientationPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        ScreenOrientationPopoverComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenOrientationPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
