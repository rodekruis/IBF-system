import { AfterViewChecked, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IonInput } from '@ionic/angular';
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
export class LoginFormComponent implements AfterViewChecked {
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

  private shouldFocus = true;

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
  ) {}

  ngAfterViewChecked() {
    if (!this.shouldFocus) {
      return;
    }

    setTimeout(() => {
      if (this.formState === 'code') {
        this.codeInput?.setFocus().catch(console.error);
      } else if (this.formState === 'email') {
        this.emailInput?.setFocus().catch(console.error);
      }
    }, 100);

    this.shouldFocus = false;
  }

  public onCodeChange(value: null | string) {
    if (this.error) {
      this.error = false;
    }
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
      return code;
    }

    return null;
  }

  public onEmailChange(value: string) {
    if (this.error && this.message) {
      this.error = false;
      this.message = null;
    }

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
    this.shouldFocus = true;
    this.formState = formState;
    this.model.code = '';
    this.message = message;
    this.error = error;
    this.codeDisplay = ['', '', '', '', '', ''];
    this.resendCodeDisabled = false;
    if (this.formState === 'email') {
      this.loginForm.resetForm();
    }
  }
}
