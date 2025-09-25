import { agent } from 'supertest';
import { User } from 'testData/types';

function api(token?: string) {
  const request = agent(process.env.API_SERVICE_URL);

  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }

  return request;
}

export async function getToken() {
  const admin = { email: 'dunant@redcross.nl', password: 'password' };

  const {
    body: {
      user: { token },
    },
  } = await api().post(`/user/login`).send(admin);

  return token;
}

export async function reset() {
  const token = await getToken();

  return api(token).post('/seed').query({ reset: true }).send();
}

export function mock(
  token: string,
  disasterType?: string,
  scenario?: string,
  countryCodeISO3?: string,
  date?: Date,
  noNotifications = true,
) {
  return api(token)
    .post(`/mock`)
    .query({ disasterType, countryCodeISO3, noNotifications })
    .send({ scenario, removeEvents: true, date: date ?? new Date() });
}

export function registerUser(
  token: string,
  user: User,
  countryCodeISO3: string,
  disasterType: string,
) {
  return api(token)
    .post(`/user`)
    .send({
      ...user,
      userRole: 'local-admin',
      countryCodesISO3: [countryCodeISO3],
      disasterTypes: [disasterType],
    });
}
