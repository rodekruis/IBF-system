import { UserRole } from 'src/app/models/user/user-role.enum';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

export class User {
  userId: string;
  token: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  whatsappNumber?: string;
  countryCodesISO3: string[];
  disasterTypes: DisasterTypeKey[];
}
