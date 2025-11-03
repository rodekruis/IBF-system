import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';

export type UpdateUser = Partial<
  Pick<
    User,
    | 'countries'
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
    return this.apiService.getUsers();
  }

  public updateUser = (user: UpdateUser, userId?: User['userId']) =>
    this.apiService.updateUser(user, userId);

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
