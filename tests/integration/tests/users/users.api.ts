import { UserRole } from '../../helpers/API-service/enum/user-role.enum';
import { api } from '../../helpers/utility.helper';

interface UserData {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  userRole: UserRole;
  countryCodesISO3: string[];
  disasterTypes: string[];
  password: string;
  whatsappNumber?: string;
}

export function createUser(token: string, userData: UserData) {
  return api(token).post('/user').send(userData);
}

export function updateUser(
  token: string,
  userData: Partial<UserData>,
  userId?: string,
) {
  return api(token).patch('/user').query({ userId }).send(userData);
}
