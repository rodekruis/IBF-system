import { UserRole } from '../../helpers/API-service/enum/user-role.enum';
import { api } from '../../helpers/utility.helper';

interface User {
  userId?: string;
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

export function createUser(token: string, user: User) {
  return api(token).post('/user').send(user);
}

export function updateUser(
  token: string,
  user: Partial<User>,
  userId?: string,
) {
  return api(token).patch('/user').query({ userId }).send(user);
}

export function deleteUser(token: string, userId: User['userId']) {
  return api(token).delete('/user').send({ userId });
}
