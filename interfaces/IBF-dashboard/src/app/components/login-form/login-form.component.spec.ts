import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { LoginFormComponent } from 'src/app/components/login-form/login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    analyticsService = jasmine.createSpyObj<AnalyticsService>(
      'AnalyticsService',
      ['logEvent'],
    );

    activatedRoute = jasmine.createSpyObj<ActivatedRoute>(
      'ActivatedRoute',
      [],
      { queryParams: of({}) },
    );

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        FormsModule,
      ],
      declarations: [LoginFormComponent],
      providers: [
        provideIonicAngular(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.model.email).toBe('');

    expect(component.model.code).toBe('');
  });

  it('should update model.email on onEmailChange', () => {
    component.error = true;

    component.message = 'Something went wrong';

    component.onEmailChange('test');

    expect(component.model.email).toBe('test');
  });

  it('should clear message on onEmailChange', () => {
    component.message = 'Something went wrong';

    component.onEmailChange('test');

    expect(component.message).toBe('');
  });

  it('should clear error on onEmailChange', () => {
    component.error = true;

    component.onEmailChange('test');

    expect(component.error).toBeFalse();
  });

  it('should update model.code on onCodeChange', () => {
    component.onCodeChange('510');

    expect(component.model.code).toBe('510');
  });

  it('should update codeDisplay on onCodeChange', () => {
    component.onCodeChange('510');

    expect(component.codeDisplay[0]).toBe('5');

    expect(component.codeDisplay[1]).toBe('1');

    expect(component.codeDisplay[2]).toBe('0');

    expect(component.codeDisplay.slice(3)).toEqual(['', '', '']);
  });

  it('should not clear message on onCodeChange', () => {
    component.message = 'Something went wrong';

    component.onCodeChange('510');

    expect(component.message).toBe('Something went wrong');
  });

  it('should clear error on onCodeChange', () => {
    component.error = true;

    component.onCodeChange('510');

    expect(component.error).toBeFalse();
  });

  it('should call onSubmit on onCodeChange', () => {
    spyOn(component, 'onSubmit');

    component.onCodeChange('510510');

    expect(component.onSubmit).toHaveBeenCalledWith();
  });

  it('should call authService.login with email on submit', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    component.model.email = 'test@example.com';

    component.onSubmit();

    const loginRequest = { email: 'test@example.com' };

    expect(authService.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should normalize email on submit', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    component.model.email = ' TEST@EXAMPLE.COM';

    component.onSubmit();

    const loginRequest = { email: 'test@example.com' };

    expect(authService.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should normalize code to 6 digits on submit', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    component.model.email = 'test@example.com';

    component.model.code = '510510 ';

    component.onSubmit();

    const loginRequest = { email: 'test@example.com', code: 510510 };

    expect(authService.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should normalize code to null on submit', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    component.model.email = 'test@example.com';

    component.model.code = '51051';

    component.onSubmit();

    const loginRequest = { email: 'test@example.com' };

    expect(authService.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should set form state to code and set message on login with email', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.formState = 'email';

    component.onSubmit();

    expect(component.model.email).toBe('test@example.com');

    expect(component.formState).toBe('code');

    expect(component.message).toBe('Code sent');

    expect(component.error).toBeFalse();

    expect(component.loginForm.resetForm).not.toHaveBeenCalledWith();
  });

  it('should set form state to email and clear message on login with email and code', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.model.code = '510510';

    component.formState = 'code';

    component.onSubmit();

    expect(component.model.email).toBeNull();

    expect(component.model.code).toBe('');

    expect(component.formState).toBe('email');

    expect(component.message).toBe('');

    expect(component.error).toBeFalse();

    expect(component.loginForm.resetForm).toHaveBeenCalledWith();
  });

  it('should set form state to code and set message on resend code', () => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.onSubmit(true);

    expect(component.model.email).toBe('test@example.com');

    expect(component.formState).toBe('code');

    expect(component.message).toBe('Code sent');

    expect(component.error).toBeFalse();

    expect(component.loginForm.resetForm).not.toHaveBeenCalledWith();
  });

  it('should show unknown message on login with email error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: null } })),
    );

    component.formState = 'email';

    component.onSubmit();

    expect(component.message).toBe('common.error.unknown');
  });

  it('should show returned message on login with email error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid' } })),
    );

    component.formState = 'email';

    component.onSubmit();

    expect(component.message).toBe('Invalid');
  });

  it('should set error on login with email error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: null } })),
    );

    component.formState = 'email';

    component.onSubmit();

    expect(component.error).toBeTrue();
  });

  it('should show unknown message on login with email and code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: null } })),
    );

    component.formState = 'code';

    component.onSubmit();

    expect(component.message).toBe('common.error.unknown');
  });

  it('should show returned message on login with email and code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid' } })),
    );

    component.formState = 'code';

    component.onSubmit();

    expect(component.message).toBe('Invalid');
  });

  it('should set error on login with email and code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: null } })),
    );

    component.formState = 'code';

    component.onSubmit();

    expect(component.error).toBeTrue();
  });

  it('should show unknown message on resend code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: null } })),
    );

    component.onSubmit(true);

    expect(component.message).toBe('common.error.unknown');
  });

  it('should show returned message on resend code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid' } })),
    );

    component.onSubmit(true);

    expect(component.message).toBe('Invalid');
  });

  it('should set form state to email and set message on login with email error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Something went wrong' } })),
    );

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.formState = 'email';

    component.onSubmit();

    expect(component.model.email).toBeNull();

    expect(component.formState).toBe('email');

    expect(component.message).toBe('Something went wrong');

    expect(component.error).toBeTrue();

    expect(component.loginForm.resetForm).toHaveBeenCalledWith();
  });

  it('should set form state to code and set message on resend code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Something went wrong' } })),
    );

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.onSubmit(true);

    expect(component.model.email).toBeNull();

    expect(component.formState).toBe('email');

    expect(component.message).toBe('Something went wrong');

    expect(component.error).toBeTrue();

    expect(component.loginForm.resetForm).toHaveBeenCalledWith();
  });

  it('should set form state to email and clear message on login with email and code error', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Failed to login' } })),
    );

    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.model.email = 'test@example.com';

    component.model.code = '510510';

    component.formState = 'code';

    component.onSubmit();

    expect(component.model.email).toBe('test@example.com');

    expect(component.model.code).toBe('');

    expect(component.formState).toBe('code');

    expect(component.message).toBe('Failed to login');

    expect(component.error).toBeTrue();

    expect(component.loginForm.resetForm).not.toHaveBeenCalledWith();
  });

  it('should reset form to email state on reenter email', () => {
    spyOn(component.loginForm, 'resetForm').and.callThrough();

    component.onReenterEmail();

    expect(component.formState).toBe('email');

    expect(component.model.email).toBeNull();

    expect(component.model.code).toBe('');

    expect(component.message).toBe('');

    expect(component.error).toBeFalse();

    expect(component.resendCodeDisabled).toBeFalse();

    expect(component.loginForm.resetForm).toHaveBeenCalledWith();
  });

  it('should set model.email from query params and call onSubmit', () => {
    Object.defineProperty(activatedRoute, 'queryParams', {
      value: of({ email: 'test@example.com' }),
    });

    spyOn(component, 'onSubmit');

    component.ngOnInit();

    expect(component.model.email).toBe('test@example.com');

    expect(component.model.code).toBe('');

    expect(component.onSubmit).toHaveBeenCalledWith();

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { email: null, code: null },
      queryParamsHandling: 'merge',
    });
  });

  it('should set model.email and model.code from query params and call onSubmit', () => {
    Object.defineProperty(activatedRoute, 'queryParams', {
      value: of({ email: 'test@example.com', code: '510510' }),
    });

    spyOn(component, 'onSubmit');

    component.ngOnInit();

    expect(component.model.email).toBe('test@example.com');

    expect(component.model.code).toBe('510510');

    expect(component.onSubmit).toHaveBeenCalledWith();

    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { email: null, code: null },
      queryParamsHandling: 'merge',
    });
  });

  it('should focus code input', fakeAsync(() => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    component.model.email = 'test@example.com';

    component.formState = 'email';

    component.onSubmit();

    expect(component.model.email).toBe('test@example.com');

    expect(component.formState).toBe('code');

    expect(component.message).toBe('Code sent');

    expect(component.error).toBeFalse();

    fixture.detectChanges();

    spyOn(component.codeInput, 'setFocus').and.callThrough();

    tick();

    expect(component.codeInput.setFocus).toHaveBeenCalledWith();
  }));

  it('should focus email input', fakeAsync(() => {
    authService.login.and.returnValue(of({ message: 'Code sent' }));

    spyOn(component.emailInput, 'setFocus').and.callThrough();

    component.model.email = 'test@example.com';

    component.model.code = '510510';

    component.formState = 'code';

    component.onSubmit();

    expect(component.model.email).toBeNull();

    expect(component.model.code).toBe('');

    expect(component.formState).toBe('email');

    expect(component.message).toBe('');

    expect(component.error).toBeFalse();

    tick();

    expect(component.emailInput.setFocus).toHaveBeenCalledWith();
  }));
});
