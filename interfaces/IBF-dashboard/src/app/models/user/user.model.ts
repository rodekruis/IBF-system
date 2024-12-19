import { UserRole } from 'src/app/models/user/user-role.enum';
import { UserStatus } from 'src/app/models/user/user-status.enum';

export class User {
  token: string;
  email: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  countries: string[];
  disasterTypes: string[];
  userStatus: UserStatus;
}
