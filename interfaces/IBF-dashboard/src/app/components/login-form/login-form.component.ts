import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  @ViewChild('loginForm')
  public loginForm: NgForm;

  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
  ) {}

  ngOnInit() {
    this.loaderService.setLoader(false);
  }

  public model = {
    email: '',
    password: '',
  };

  public onSubmit() {
    this.loaderService.setLoader(true);
    this.authService
      .login(this.model.email, this.model.password, () => {
        this.loaderService.setLoader(false);
      })
      .then(() => {
        this.loginForm.resetForm();
      });
  }
}
