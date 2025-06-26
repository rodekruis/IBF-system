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

export function createUser(userData: UserData, token: string) {
  return api(token).post('/user').send(userData);
}

export function updateUser(
  email: string,
  userData: Partial<UserData>,
  token: string,
) {
  return api(token).patch('/user').query({ email }).send(userData);
}

export function changePassword(email: string, password: string, token: string) {
  return api(token).post('/user/change-password').send({ email, password });
}

export function login(email: string, password: string) {
  return api().post('/user/login').send({ email, password });
}
