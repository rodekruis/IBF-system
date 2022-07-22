import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { StopTriggerPopoverComponent } from './stop-trigger-popover.component';

describe('StopTriggerPopoverComponent', () => {
  let component: StopTriggerPopoverComponent;
  let fixture: ComponentFixture<StopTriggerPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StopTriggerPopoverComponent],
        imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(StopTriggerPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
