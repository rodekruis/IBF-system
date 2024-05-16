import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import users from '../../src/scripts/json/users.json';
import { FloodsScenario } from '../../src/scripts/enum/mock-scenario.enum';
import { DisasterType } from '../../src/api/disaster/disaster-type.enum';

export async function getAccessToken(): Promise<string> {
  const admin = users.find((user) => user.userRole === 'admin');
  const login = await loginApi(admin.email, admin.password);

  const accessToken = login.body.user.token;
  return accessToken;
}

export function loginApi(
  email: string,
  password: string,
): Promise<request.Response> {
  return getServer().post(`/user/login`).send({
    email,
    password,
  });
}

export function getHostname(): string {
  return 'http://localhost:3000/api';
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
