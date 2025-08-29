import { api } from '@helpers/utility.helper';

export function login(email: string, code?: number) {
  return api().post('/login').send({ email, code });
}
