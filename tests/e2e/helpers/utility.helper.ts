import { agent } from 'supertest';

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

  return api(token)
    .post('/scripts/reset')
    .query({ includeLinesData: false })
    .send({ secret: process.env.RESET_SECRET });
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
    .post(`/scripts/mock`)
    .query({ disasterType, countryCodeISO3, noNotifications })
    .send({
      scenario,
      secret: process.env.RESET_SECRET,
      removeEvents: true,
      date: date ?? new Date(),
    });
}
