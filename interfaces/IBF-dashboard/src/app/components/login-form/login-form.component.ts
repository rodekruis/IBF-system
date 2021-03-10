import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  public model = {
    email: '',
    password: '',
  };

  constructor(private authService: AuthService) {}

  public onSubmit() {
    this.authService.login(this.model.email, this.model.password).add(() => {
      this.loginForm.resetForm();
    });
  }
}
