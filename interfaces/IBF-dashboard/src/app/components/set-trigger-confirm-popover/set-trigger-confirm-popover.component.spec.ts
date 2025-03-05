import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SetTriggerConfirmPopoverComponent } from 'src/app/components/set-trigger-confirm-popover/set-trigger-confirm-popover.component';

describe('SetTriggerConfirmPopoverComponent', () => {
  let component: SetTriggerConfirmPopoverComponent;
  let fixture: ComponentFixture<SetTriggerConfirmPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetTriggerConfirmPopoverComponent],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterModule.forRoot([]),
      ],
      providers: [
        PopoverController,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetTriggerConfirmPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
