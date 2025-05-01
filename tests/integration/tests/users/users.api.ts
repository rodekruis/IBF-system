import { CreateUserDto } from '../../helpers/API-service/dto/create-user.dto';
import { UpdateUserDto } from '../../helpers/API-service/dto/update-user.dto';
import { api } from '../../helpers/utility.helper';

export function createUser(userData: CreateUserDto, token: string) {
  return api(token).post('/user').send(userData);
}

export function updateUser(
  email: string,
  updateUserData: UpdateUserDto,
  token: string,
) {
  return api(token).patch('/user').query({ email }).send(updateUserData);
}

export function changePassword(email: string, password: string, token: string) {
  return api(token).post('/user/change-password').send({ email, password });
}

export function login(email: string, password: string) {
  return api().post('/user/login').send({ email, password });
}
