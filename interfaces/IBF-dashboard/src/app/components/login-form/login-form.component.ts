import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { AuthService, LoginMessageResponse } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: false,
})
export class LoginFormComponent implements OnInit {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  @ViewChild('emailInput', { static: false })
  public emailInput: IonInput;

  @ViewChild('codeInput', { static: false })
  public codeInput: IonInput;

  public formState: 'code' | 'email' = 'email';
  public model = { email: '', code: '' };
  public resendCodeDisabled = false;
  public codeDisplay: string[] = ['', '', '', '', '', ''];
  public message: null | string = null;
  public error = false;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.model.email = String(params['email']);
      }

      if (params['code']) {
        this.model.code = String(params['code']);
      }

      if (params['email']) {
        this.onSubmit();
      }
    });

    void this.router.navigate([], {
      queryParams: { email: null, code: null },
      queryParamsHandling: 'merge',
    });
  }

  public onCodeChange(value: null | string) {
    this.error = false;
    this.model.code = value?.replace(/\D/g, '').slice(0, 6);

    this.codeDisplay = this.model.code
      ?.split('')
      .concat(Array(6 - this.model.code.length).fill(''));

    if (this.model.code?.length === 6) {
      this.onSubmit();
    }
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizeCode(code: string) {
    if (code?.trim().length === 6) {
      return code.trim();
    }

    return null;
  }

  public onEmailChange(value: string) {
    this.error = false;
    this.message = null;
    this.model.email = value;
  }

  public onSubmit(resendCode = false) {
    const email = this.normalizeEmail(this.model.email);
    const code = this.normalizeCode(this.model.code);

    this.resendCodeDisabled = true;

    this.authService.login(email, code).subscribe({
      next: ({ message }: LoginMessageResponse) => {
        if (this.formState === 'email' || resendCode) {
          this.resetForm('code', message);
        } else {
          this.resetForm('email');
        }
      },
      error: ({ error: { message } }: { error: LoginMessageResponse }) => {
        message =
          message ??
          String(this.translateService.instant('common.error.unknown'));
        if (this.formState === 'email' || resendCode) {
          this.resetForm('email', message, true);
        } else {
          this.resetForm('code', message, true);
        }
      },
    });

    let analyticsEvent = AnalyticsEvent.loginCode;

    if (resendCode) {
      analyticsEvent = AnalyticsEvent.loginResend;
    } else if (this.formState === 'email') {
      analyticsEvent = AnalyticsEvent.loginEmail;
    }

    this.analyticsService.logEvent(analyticsEvent, {
      page: AnalyticsPage.login,
      component: this.constructor.name,
    });
  }

  public onReenterEmail() {
    this.resetForm('email');

    this.analyticsService.logEvent(AnalyticsEvent.loginReenter, {
      page: AnalyticsPage.login,
      component: this.constructor.name,
    });
  }

  private resetForm(
    formState: 'code' | 'email' = 'email',
    message: null | string = null,
    error = false,
  ) {
    if (formState === 'email') {
      this.loginForm.resetForm();
    }
    this.formState = formState;
    this.model.code = '';
    this.codeDisplay = ['', '', '', '', '', ''];
    this.message = message;
    this.error = error;
    this.resendCodeDisabled = false;

    setTimeout(() => {
      if (formState === 'email') {
        void this.emailInput?.setFocus();
      } else {
        void this.codeInput?.setFocus();
      }
    });
  }
}
