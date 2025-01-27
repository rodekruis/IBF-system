import { UserRole } from '../enum/user-role.enum';
import { UserStatus } from '../enum/user-status.enum';

export interface UpdateUserDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  whatsappNumber?: string;
}
