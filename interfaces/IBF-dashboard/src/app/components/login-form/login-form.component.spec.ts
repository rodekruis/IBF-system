import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ForgotPasswordPopoverComponent } from 'src/app/components/forgot-password-popover/forgot-password-popover.component';
import { LoginFormComponent } from 'src/app/components/login-form/login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: AuthService;
  let popoverController: PopoverController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule,
        FormsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jasmine.createSpy('login').and.returnValue({
              add: jasmine
                .createSpy('add')
                .and.callFake((callback) => callback()),
            }),
          },
        },
        {
          provide: PopoverController,
          useValue: {
            create: jasmine
              .createSpy('create')
              .and.resolveTo({ present: jasmine.createSpy('present') }),
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    popoverController = TestBed.inject(PopoverController);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.model.email).toBe('');
    expect(component.model.password).toBe('');
    expect(component.inputType).toBe('password');
    expect(component.labelShow).toBe('Show password');
    expect(component.labelHide).toBe('Hide password');
  });

  it('should call authService.login on onSubmit', () => {
    component.model.email = 'dunant@redcross.nl';
    component.model.password = 'password';
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(
      'dunant@redcross.nl',
      'password',
    );
  });

  it('should reset form on successful login', () => {
    component.loginForm = {
      resetForm: jasmine.createSpy('resetForm') as () => void,
    } as NgForm;
    component.model.email = 'dunant@redcross.nl';
    component.model.password = 'password';
    component.onSubmit();

    expect(component.loginForm.resetForm).toHaveBeenCalled();
  });

  it('should toggle inputType on toggleInputType', () => {
    component.inputType = 'password';
    component.toggleInputType();

    expect(component.inputType).toBe('text');
    component.toggleInputType();

    expect(component.inputType).toBe('password');
  });

  it('should present popover on presentPopover', async () => {
    await component.presentPopover();
    const popoverOptions = {
      component: ForgotPasswordPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-normal',
      translucent: true,
      showBackdrop: true,
    };

    expect(popoverController.create).toHaveBeenCalledWith(popoverOptions);

    const popover = await popoverController.create(popoverOptions);

    expect(popover.present).toHaveBeenCalled();
  });

  it('should return true if inputType is password', () => {
    component.inputType = 'password';

    expect(component.isPassword()).toBeTrue();
  });

  it('should return false if inputType is not password', () => {
    component.inputType = 'text';

    expect(component.isPassword()).toBeFalse();
  });
});
