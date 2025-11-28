import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { readUsersAssertions } from './read-users.assertions';
import { createUser, deleteUser, readUser } from './users.api';

export default function readUserTests() {
  describe('read users', () => {
    let token: string;
    const userId: Partial<Record<keyof typeof userData, string>> = {};

    beforeAll(async () => {
      token = await getToken();

      // create users
      for (const userDataKey of Object.keys(userData)) {
        const createUserResponse = await createUser(
          token,
          userData[userDataKey],
        );
        userId[userDataKey] = createUserResponse.body.user.userId;
      }
    });

    afterAll(async () => {
      // cleanup users
      for (const userDataKey of Object.keys(userData)) {
        await deleteUser(token, userId[userDataKey]);
        delete userId[userDataKey];
      }
    });

    readUsersAssertions.forEach(({ userDataKey, status, count }) => {
      it(`${userDataKey} should read ${count ?? 0} users`, async () => {
        const token = await getToken(userData[userDataKey].email);
        const readUserResponse = await readUser(token);

        expect(readUserResponse.status).toBe(status);

        const users = readUserResponse.body;
        if (Number.isInteger(count)) {
          expect(users.length).toBe(count);

          // users (except admins) should only see users from their countries
          if (userData[userDataKey].userRole !== UserRole.Admin) {
            for (const user of users) {
              // each user must be in one of the admin's countries
              expect(
                user.countryCodesISO3.some((countryCodeISO3: string) =>
                  userData[userDataKey].countryCodesISO3.includes(
                    countryCodeISO3,
                  ),
                ),
              ).toBe(true);
            }
          }
        }
      });
    });

    it('should filter users by country', async () => {
      const token = await getToken(userData['admin-multi'].email);
      const readUserResponse = await readUser(token).query({
        countryCodeISO3: 'PHL',
      });

      expect(readUserResponse.status).toBe(200);

      const users = readUserResponse.body;
      expect(users.length).toBe(10);

      for (const user of users) {
        expect(user.countryCodesISO3).toContain('PHL');
      }
    });

    it('should filter users by disaster type', async () => {
      const token = await getToken(userData['admin-multi'].email);
      const readUserResponse = await readUser(token).query({
        disasterType: 'floods',
      });

      expect(readUserResponse.status).toBe(200);

      const users = readUserResponse.body;
      expect(users.length).toBe(21);

      for (const user of users) {
        expect(user.disasterTypes).toContain('floods');
      }
    });

    it('should filter users by country and disaster type', async () => {
      const token = await getToken(userData['admin-multi'].email);
      const readUserResponse = await readUser(token).query({
        countryCodeISO3: 'PHL',
        disasterType: 'floods',
      });

      expect(readUserResponse.status).toBe(200);

      const users = readUserResponse.body;
      expect(users.length).toBe(8);

      for (const user of users) {
        expect(user.countryCodesISO3).toContain('PHL');
        expect(user.disasterTypes).toContain('floods');
      }
    });

    it('should error if not admin of filtered country', async () => {
      const token = await getToken(userData['admin-philippines'].email);
      const readUserResponse = await readUser(token).query({
        countryCodeISO3: 'UGA',
      });

      expect(readUserResponse.status).toBe(403);
    });
  });
}
