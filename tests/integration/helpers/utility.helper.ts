import { agent } from 'supertest';

import { DisasterType } from './API-service/enum/disaster-type.enum';
import {
  DroughtScenario,
  FlashFloodsScenario,
  FloodsScenario,
  MalariaScenario,
  TyphoonScenario,
} from './API-service/enum/mock-scenario.enum';
import { UserRole } from './API-service/enum/user-role.enum';

export function api(token?: string) {
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

export async function getNonAdminToken() {
  // First get admin token to create a non-admin user
  const adminToken = await getToken();

  const nonAdminUser = {
    email: 'operator@redcross.nl',
    firstName: 'Test',
    lastName: 'Operator',
    userRole: UserRole.Operator,
    countryCodesISO3: ['UGA'],
    disasterTypes: ['floods'],
    password: 'password',
  };

  // Try to create the user (will fail if it already exists, which is fine)
  try {
    await api(adminToken).post('/user').send(nonAdminUser);
  } catch (error) {
    // User already exists, continue
  }

  // Login with the non-admin user
  const {
    body: {
      user: { token },
    },
  } = await api()
    .post(`/user/login`)
    .send({ email: nonAdminUser.email, password: nonAdminUser.password });

  return token;
}

export async function reset() {
  const token = await getToken();

  return api(token).post('/seed').query({ reset: true }).send();
}

export function mock(
  token: string,
  scenario?:
    | FloodsScenario
    | FlashFloodsScenario
    | TyphoonScenario
    | MalariaScenario
    | DroughtScenario,
  disasterType?: DisasterType,
  countryCodeISO3?: string,
  date?: Date | null,
  removeEvents = true,
  noNotifications = true,
) {
  return api(token)
    .post('/mock')
    .query({ disasterType, countryCodeISO3, noNotifications })
    .send({ scenario, removeEvents, date: date ?? new Date() });
}

export function notify(
  token: string,
  countryCodeISO3: string,
  disasterType: DisasterType,
  noNotifications = true,
) {
  return api(token)
    .post('/events/notify')
    .query({ noNotifications })
    .send({ countryCodeISO3, disasterType });
}
