import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';

import users from '../../../services/API-service/src/scripts/json/users.json';

export async function getAccessToken(): Promise<string> {
  const admin = users.find(
    (user: { userRole: string }) => user.userRole === 'admin',
  );
  if (!admin) throw new Error('Admin not found');

  const login = await loginApi(admin?.email, admin?.password);
  const accessToken = login.body.user.token;
  return accessToken;
}

export function loginApi(
  email: string,
  password?: string,
): Promise<request.Response> {
  return getServer().post(`/user/login`).send({
    email,
    password,
  });
}

export function getHostname(): string | undefined {
  // Use here the port the API-service is exposed to on the host, as the e2e tests are run on the host

  return process.env.API_SERVICE_URL;
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

export function mockData(
  disasterType: string,
  scenario: string,
  countryCodeISO3: string,
  accessToken: string,
  date?: Date,
): Promise<request.Response> {
  return getServer()
    .post(`/scripts/mock`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ disasterType, countryCodeISO3, isApiTest: true })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: date ?? new Date(),
    });
}
