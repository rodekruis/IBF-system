import { UserRole } from 'src/api/user/user-role.enum';
import { UserStatus } from 'src/api/user/user-status.enum';

export class User {
  public id: string;
  public email: string;
  public username: string;
  public firstName: string;
  public middleName?: string;
  public lastName: string;
  public userRole: UserRole;
  public userStatus: UserStatus;
  public countries: string[];
  public exp: number;
  public iat: number;
}
