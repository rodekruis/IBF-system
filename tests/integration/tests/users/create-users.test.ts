import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser } from './users.api';

export default function createUsersTests() {
  describe('create users', () => {
    let adminToken: string;
    const userId: Partial<Record<keyof typeof userData, string>> = {};
    const userRoles = Object.values(UserRole);

    beforeAll(async () => {
      adminToken = await getToken();

      // create users
      for (const userRoleIndex in userRoles) {
        const userRole = userRoles[userRoleIndex];
        const userDataKey = `${userRole}-multi`;

        const createUserResponse = await createUser(
          adminToken,
          userData[userDataKey],
        );

        userId[userDataKey] = createUserResponse.body.userId;
      }
    });

    afterAll(async () => {
      // cleanup users
      for (const userIdKey in userId) {
        await deleteUser(adminToken, userId[userIdKey]);
        delete userId[userIdKey];
      }
    });

    it('should create user for admin', async () => {
      // pick users to create
      const adminUserToken = await getToken(userData['admin-multi'].email);
      const operatorUgandaUserData = userData['operator-uganda'];

      // create user
      const createUserResponse = await createUser(
        adminUserToken,
        operatorUgandaUserData,
      );

      // created user must have the correct attributes
      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.body.userRole).toBe(UserRole.Operator);
      // countries should be alphabetically sorted
      expect(createUserResponse.body.countryCodesISO3).toStrictEqual(
        operatorUgandaUserData.countryCodesISO3.sort(),
      );
      // disaster types should be alphabetically sorted
      expect(createUserResponse.body.disasterTypes).toStrictEqual(
        operatorUgandaUserData.disasterTypes.sort(),
      );

      // store userId for cleanup
      userId['operator-uganda'] = createUserResponse.body.userId;
    });

    it('should create user for local-admin', async () => {
      // pick users to create
      const localAdminUserToken = await getToken(
        userData['local-admin-multi'].email,
      );
      const operatorPhilippinesUserData = userData['operator-philippines'];

      // create user
      const createUserResponse = await createUser(
        localAdminUserToken,
        operatorPhilippinesUserData,
      );

      // created user must have the correct attributes
      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.body.userRole).toBe(UserRole.Operator);
      // countries should be alphabetically sorted
      expect(createUserResponse.body.countryCodesISO3).toStrictEqual(
        operatorPhilippinesUserData.countryCodesISO3.sort(),
      );
      // disaster types should be alphabetically sorted
      expect(createUserResponse.body.disasterTypes).toStrictEqual(
        operatorPhilippinesUserData.disasterTypes.sort(),
      );

      // store userId for cleanup
      userId['operator-philippines'] = createUserResponse.body.userId;
    });

    it('should error if email exists', async () => {
      // pick a user to create
      const operatorUgandaUserData = userData['operator-uganda'];

      // attempt to create user with same email
      const createUserResponse = await createUser(
        adminToken,
        operatorUgandaUserData,
      );

      // should return bad request
      expect(createUserResponse.status).toBe(400);
    });

    [UserRole.Operator, UserRole.Pipeline, UserRole.Viewer].forEach(
      (userRole) => {
        it(`should error if ${userRole} creates user`, async () => {
          // login as the role
          const userRoleUserData = userData[`${userRole}-multi`];
          const userRoleUserToken = await getToken(userRoleUserData.email);

          // prepare new user data
          const notAllowedUserData = {
            email: 'not-allowed@redcross.nl',
            firstName: 'Not',
            lastName: 'Allowed',
            userRole: UserRole.Viewer,
            countryCodesISO3: ['UGA'],
            disasterTypes: ['floods'],
            password: 'password',
          };

          // attempt to create user
          const createUserResponse = await createUser(
            userRoleUserToken,
            notAllowedUserData,
          );

          // should return forbidden
          expect(createUserResponse.status).toBe(403);
        });
      },
    );
  });
}
