import { UserRole } from '../enum/user-role.enum';
import { UserStatus } from '../enum/user-status.enum';

export interface CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: UserRole;
  countryCodesISO3: string[];
  disasterTypes: string[];
  status: UserStatus;
  password: string;
  whatsappNumber: string;
}
