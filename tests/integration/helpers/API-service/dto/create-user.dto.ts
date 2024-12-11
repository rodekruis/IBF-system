import { UserRole } from '../enum/user-role.enum';
import { UserStatus } from '../enum/user-status.enum';

const userRoleArray = Object.values(UserRole).map((item) => String(item));

export class CreateUserDto {
  public email: string;
  public username: string;
  public firstName: string;
  public middleName?: string;
  public lastName: string;
  public role: UserRole;
  public countryCodesISO3: string[];
  public disasterTypes: string[];
  public status: UserStatus;
  public password: string;
  public whatsappNumber: string;
}
