import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ForgotPasswordPopoverComponent } from 'src/app/components/forgot-password-popover/forgot-password-popover.component';

describe('ForgotPasswordPopoverComponent', () => {
  let component: ForgotPasswordPopoverComponent;
  let fixture: ComponentFixture<ForgotPasswordPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        ForgotPasswordPopoverComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
