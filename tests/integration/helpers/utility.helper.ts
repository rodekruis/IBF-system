import { agent } from 'supertest';

import { DisasterType } from './API-service/enum/disaster-type.enum';
import {
  DroughtScenario,
  FlashFloodsScenario,
  FloodsScenario,
  MalariaScenario,
  TyphoonScenario,
} from './API-service/enum/mock-scenario.enum';

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

export async function reset() {
  const token = await getToken();

  return api(token)
    .post('/scripts/reset')
    .query({ includeLinesData: false })
    .send({ secret: process.env.RESET_SECRET });
}

export function mock(
  scenario:
    | FloodsScenario
    | FlashFloodsScenario
    | TyphoonScenario
    | MalariaScenario
    | DroughtScenario,
  disasterType: DisasterType,
  countryCodeISO3: string,
  date: Date | null,
  token: string,
  removeEvents = true,
  noNotifications = true,
) {
  return api(token)
    .post('/scripts/mock')
    .query({ disasterType, countryCodeISO3, noNotifications })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents,
      date: date ?? new Date(),
    });
}

export function notify(
  countryCodeISO3: string,
  disasterType: DisasterType,
  token: string,
  noNotifications = true,
) {
  return api(token)
    .post('/events/notify')
    .query({ noNotifications })
    .send({ countryCodeISO3, disasterType });
}
