import { UserRole } from '../enum/user-role.enum';

export interface UpdateUserDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  role?: UserRole;
  whatsappNumber?: string;
}
