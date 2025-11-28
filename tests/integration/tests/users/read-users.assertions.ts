import { userData } from 'fixtures/users.const';

export interface ReadUsersAssertion {
  userDataKey: keyof typeof userData;
  status: 200 | 403;
  count?: number;
}

export const readUsersAssertions: ReadUsersAssertion[] = [
  { userDataKey: 'admin-multi', status: 200, count: 26 },
  { userDataKey: 'local-admin-multi', status: 200, count: 18 },
  { userDataKey: 'operator-multi', status: 403 },
  { userDataKey: 'pipeline-multi', status: 403 },
  { userDataKey: 'viewer-multi', status: 403 },
  { userDataKey: 'admin-uganda', status: 200, count: 26 },
  { userDataKey: 'local-admin-uganda', status: 200, count: 13 },
  { userDataKey: 'admin-uganda-drought', status: 200, count: 26 },
  { userDataKey: 'local-admin-uganda-drought', status: 200, count: 13 },
  { userDataKey: 'admin-philippines', status: 200, count: 26 },
  { userDataKey: 'local-admin-philippines', status: 200, count: 10 },
  { userDataKey: 'admin-philippines-typhoon', status: 200, count: 26 },
  { userDataKey: 'local-admin-philippines-typhoon', status: 200, count: 10 },
  { userDataKey: 'admin-southern-africa', status: 200, count: 26 },
  { userDataKey: 'local-admin-southern-africa', status: 200, count: 2 },
  { userDataKey: 'admin-eastern-africa', status: 200, count: 26 },
  { userDataKey: 'local-admin-eastern-africa', status: 200, count: 13 },
  { userDataKey: 'admin-central-africa', status: 200, count: 26 },
  { userDataKey: 'local-admin-central-africa', status: 200, count: 2 },
  { userDataKey: 'admin-western-africa', status: 200, count: 26 },
  { userDataKey: 'local-admin-western-africa', status: 200, count: 2 },
  { userDataKey: 'admin-northern-africa', status: 200, count: 26 },
  { userDataKey: 'local-admin-northern-africa', status: 200, count: 2 },
];
