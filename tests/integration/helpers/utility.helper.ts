import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { DisasterType } from '../../../services/API-service/src/api/disaster/disaster-type.enum';
import { CreateUserDto } from '../../../services/API-service/src/api/user/dto/create-user.dto';
import {
  EpidemicsScenario,
  FlashFloodsScenario,
  FloodsScenario,
  TyphoonScenario,
} from '../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import users from '../../../services/API-service/src/scripts/json/users.json';

export async function getAccessToken(): Promise<string> {
  const admin = users.find((user) => user.userRole === 'admin');
  const login = await loginUser(admin.email, admin.password);

  const accessToken = login.body.user.token;
  return accessToken;
}

export function loginUser(
  email: string,
  password?: string,
): Promise<request.Response> {
  return getServer().post(`/user/login`).send({
    email,
    password,
  });
}

export function getHostname(): string {
  return process.env.API_SERVICE_URL;
}

export function getEventTitle(disasterType: string, eventName: string) {
  return `${disasterType}: ${eventName}`.toLowerCase();
}

export function getServer(): TestAgent<request.Test> {
  return request.agent(getHostname());
}

export function resetDB(accessToken: string): Promise<request.Response> {
  return getServer()
    .post('/scripts/reset')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      secret: process.env.RESET_SECRET,
    });
}

export function mockFloods(
  scenario: FloodsScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/mock/floods')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: new Date(),
      countryCodeISO3,
    });
}

export function mockEpidemics(
  scenario: EpidemicsScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/mock/epidemics')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: new Date(),
      countryCodeISO3,
    });
}

export function mockFlashFlood(
  scenario: FlashFloodsScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/mock/flash-floods')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: new Date(),
      countryCodeISO3,
    });
}

export function mockTyphoon(
  scenario: TyphoonScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/scripts/mock-typhoon-scenario')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      scenario,
      eventNr: 1,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: new Date(),
      countryCodeISO3,
    });
}

export function mockDynamicData(
  disasterType: DisasterType,
  countryCodeISO3: string,
  triggered: boolean,
  accessToken: string,
  date?: Date,
): Promise<request.Response> {
  return getServer()
    .post('/scripts/mock-dynamic-data')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      disasterType,
      secret: process.env.RESET_SECRET,
      triggered,
      removeEvents: true,
      date: date ? date : new Date(),
      countryCodeISO3,
    });
}

export function sendNotification(
  countryCodeISO3: string,
  disasterType: DisasterType,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/notification/send')
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ isApiTest: true })
    .send({
      countryCodeISO3,
      disasterType,
    });
}

export function createUser(
  userData: CreateUserDto,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/user')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(userData);
}

export function changePassword(
  email: string,
  password: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post('/user/change-password')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ email, password });
}
