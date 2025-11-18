import { agent } from 'supertest';
import { UserRole } from 'testData/enums';
import { Dataset, User } from 'testData/types';

function api(token?: string) {
  const request = agent(process.env.API_SERVICE_URL);

  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }

  return request;
}

export async function getToken(email = 'dunant@redcross.nl') {
  const {
    body: { code },
  } = await api().post(`/login`).send({ email });

  const {
    body: {
      user: { token },
    },
  } = await api().post(`/login`).send({ email, code });

  return token;
}

export async function reset() {
  const token = await getToken();

  return api(token).post('/seed').query({ reset: true }).send();
}

export async function mock(
  disasterType?: string,
  scenario?: string,
  countryCodeISO3?: string,
  date?: Date,
  noNotifications = true,
) {
  const token = await getToken();

  return api(token)
    .post(`/mock`)
    .query({ disasterType, countryCodeISO3, noNotifications })
    .send({ scenario, removeEvents: true, date: date ?? new Date() });
}

export async function registerUser(
  { firstName, lastName }: User,
  email: string,
  countryCodeISO3: string,
  disasterType: string,
  userRole: UserRole,
) {
  const token = await getToken();

  return api(token)
    .post(`/user`)
    .send({
      email,
      password: 'password',
      firstName,
      lastName,
      userRole,
      countryCodesISO3: [countryCodeISO3],
      disasterTypes: [disasterType],
    });
}

export function getUserEmail(dataset: Dataset, userRole: UserRole) {
  const {
    country: { code },
    disasterType: { name },
  } = dataset;

  return `${code}-${name}-${userRole}@redcross.nl`;
}

export function getStorageState(configurationId: number, userRole: UserRole) {
  return `.auth/state-${configurationId}-${userRole}.json`;
}
