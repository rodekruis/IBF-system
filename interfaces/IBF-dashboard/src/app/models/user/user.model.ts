import { UserRole } from 'src/app/models/user/user-role.enum';

export class User {
  token: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  countries: string[];
  disasterTypes: string[];
}
