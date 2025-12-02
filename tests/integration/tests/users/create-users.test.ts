import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser, readUser } from './users.api';

export default function createUsersTests() {
  describe('create users', () => {
    let adminToken: string;
    const operatorMultiUserData = userData['operator-multi'];

    beforeAll(async () => {
      adminToken = await getToken();
    });

    afterAll(async () => {
      // cleanup users
      const readUserResponse = await readUser(adminToken);
      const users = readUserResponse.body;

      for (const { userId } of users) {
        await deleteUser(adminToken, userId);
      }
    });

    it('should create user', async () => {
      // create user
      const createUserResponse = await createUser(
        adminToken,
        operatorMultiUserData,
      );

      // created user must have the correct attributes
      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.body.userRole).toBe(UserRole.Operator);
      // countries should be alphabetically sorted
      expect(createUserResponse.body.countryCodesISO3).toStrictEqual(
        operatorMultiUserData.countryCodesISO3.sort(),
      );
      // disaster types should be alphabetically sorted
      expect(createUserResponse.body.disasterTypes).toStrictEqual(
        operatorMultiUserData.disasterTypes.sort(),
      );
    });

    it('should error if email exists', async () => {
      // attempt to create user with same email
      const createUserResponse = await createUser(
        adminToken,
        operatorMultiUserData,
      );

      // should return bad request
      expect(createUserResponse.status).toBe(400);
    });

    [
      UserRole.LocalAdmin,
      UserRole.Operator,
      UserRole.Pipeline,
      UserRole.Viewer,
    ].forEach((userRole) => {
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
    });
  });
}
