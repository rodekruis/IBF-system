import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  constructor() {}

  public model = {
    email: '',
    password: '',
  };

  ngOnInit() {}

  public onSubmit() {
    console.log('do login!');
  }
}
