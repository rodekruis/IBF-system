import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: false,
})
export class LoginFormComponent {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  public formState: 'login' | 'verify' = 'login';
  public model = { email: '', code: '' };

  constructor(private authService: AuthService) {}

  public onSubmit() {
    if (this.formState === 'login') {
      this.authService.login(this.model.email.toLowerCase()).add(() => {
        this.formState = 'verify';
      });
    } else {
      this.authService
        .verifyLogin(this.model.email.toLowerCase(), this.model.code)
        .add(() => {
          this.loginForm.resetForm();
        });
    }
  }
}
