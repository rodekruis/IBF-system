import { UserRole } from 'src/app/models/user/user-role.enum';

export class User {
  userId: string;
  token: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  whatsappNumber?: string;
  countries: string[];
  disasterTypes: string[];
}
