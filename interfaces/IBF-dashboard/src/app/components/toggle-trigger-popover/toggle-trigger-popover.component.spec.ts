import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleTriggerPopoverComponent } from 'src/app/components/toggle-trigger-popover/toggle-trigger-popover.component';

describe('ToggleTriggerPopoverComponent', () => {
  let component: ToggleTriggerPopoverComponent;
  let fixture: ComponentFixture<ToggleTriggerPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToggleTriggerPopoverComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleTriggerPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
