import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SetTriggerPopoverComponent } from 'src/app/components/set-trigger-popover/set-trigger-popover.component';

describe('SetTriggerPopoverComponent', () => {
  let component: SetTriggerPopoverComponent;
  let fixture: ComponentFixture<SetTriggerPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetTriggerPopoverComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [PopoverController],
    }).compileComponents();
    fixture = TestBed.createComponent(SetTriggerPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
