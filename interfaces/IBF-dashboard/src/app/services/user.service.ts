import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';

export type CreateUser = Pick<
  User,
  | 'countryCodesISO3'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'userRole'
  | 'whatsappNumber'
>;

export type UpdateUser = Partial<
  Pick<
    User,
    | 'countryCodesISO3'
    | 'disasterTypes'
    | 'firstName'
    | 'lastName'
    | 'middleName'
    | 'userRole'
    | 'whatsappNumber'
  >
>;

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private apiService: ApiService) {}

  get users() {
    return this.apiService.readUsers();
  }

  public createUser = (user: CreateUser) => this.apiService.createUser(user);

  public updateUser = (updateUser: UpdateUser, userId?: User['userId']) =>
    this.apiService.updateUser(updateUser, userId);

  public getUserName = (user: User) => {
    if (!user) {
      return 'Unknown User'; // should match getUserInitials
    }

    return [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ');
  };

  public getUserInitials = (user: User) => {
    if (!user) {
      return 'UU'; // should match getUserName
    }

    return [user.firstName, user.lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join('');
  };
}
