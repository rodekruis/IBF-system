import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

export class User {
  token: string;
  email: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  countries: string[];
  userStatus: UserStatus;
}
