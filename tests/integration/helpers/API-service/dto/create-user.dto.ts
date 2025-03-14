import { UserRole } from '../enum/user-role.enum';

export interface CreateUserDto {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  countryCodesISO3: string[];
  disasterTypes: string[];
  password: string;
  whatsappNumber: string;
}
