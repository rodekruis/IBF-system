import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService, UserResponse } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-manage-account',
  imports: [
    IonItem,
    IonInput,
    IonList,
    IonLabel,
    TranslateModule,
    IonButton,
    FormsModule,
  ],
  templateUrl: './manage-account.component.html',
})
export class ManageAccountComponent implements OnDestroy {
  @ViewChild('accountForm')
  public accountForm: NgForm;

  private authSubscription: Subscription;
  public email = '';
  public role = null;
  public model = {
    firstName: '',
    middleName: '',
    lastName: '',
    whatsappNumber: '',
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.authSubscription = this.authService
      .getAuthSubscription()
      .subscribe(this.onAuthChange);
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  private onAuthChange = (user: null | User) => {
    if (!user) {
      return;
    }

    if (this.accountForm) {
      this.accountForm.resetForm(user);
    } else {
      this.model.firstName = user.firstName;
      this.model.middleName = user.middleName;
      this.model.lastName = user.lastName;
      this.model.whatsappNumber = user.whatsappNumber;
      this.email = user.email;
      this.role = user.userRole;
    }
  };

  public onSubmit() {
    this.apiService
      .updateUser(this.model)
      .subscribe((response: UserResponse) => {
        this.authService.setUser(response);
      });
  }
}
