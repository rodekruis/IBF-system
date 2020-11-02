import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  constructor(private authService: AuthService) {}

  public model = {
    email: '',
    password: '',
  };

  ngOnInit() {}

  public onSubmit() {
    this.authService.login(this.model.email, this.model.password).then(() => {
      this.loginForm.resetForm();
    });
  }
}
