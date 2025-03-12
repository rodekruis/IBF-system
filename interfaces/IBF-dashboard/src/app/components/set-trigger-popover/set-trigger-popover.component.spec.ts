import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SetTriggerPopoverComponent } from 'src/app/components/set-trigger-popover/set-trigger-popover.component';

describe('SetTriggerPopoverComponent', () => {
  let component: SetTriggerPopoverComponent;
  let fixture: ComponentFixture<SetTriggerPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetTriggerPopoverComponent],
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
    fixture = TestBed.createComponent(SetTriggerPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
