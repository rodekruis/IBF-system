import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser } from './users.api';

export default function createUsersTests() {
  describe('create users', () => {
    let token: string;
    let operatorMultiUserId: string;
    const operatorMultiUser = userData['operator-multi'];

    beforeAll(async () => {
      token = await getToken();
    });

    afterAll(async () => {
      await deleteUser(token, operatorMultiUserId);
    });

    it('should create user', async () => {
      // create user
      const createUserResponse = await createUser(token, operatorMultiUser);

      // created user must have the correct attributes
      expect(createUserResponse.status).toBe(201);
      expect(createUserResponse.body.user.userRole).toBe(UserRole.Operator);
      // countries should be alphabetically sorted
      expect(createUserResponse.body.user.countries).toStrictEqual(
        operatorMultiUser.countryCodesISO3.sort(),
      );
      // disaster types should be alphabetically sorted
      expect(createUserResponse.body.user.disasterTypes).toStrictEqual(
        operatorMultiUser.disasterTypes.sort(),
      );

      // store other user id for cleanup
      operatorMultiUserId = createUserResponse.body.user.userId;
    });

    it('should fail if email exists', async () => {
      // attempt to create user with same email
      const createUserResponse = await createUser(token, operatorMultiUser);

      // should return bad request
      expect(createUserResponse.status).toBe(400);
    });

    it('should fail if operator creates user', async () => {
      // login as operator
      const operatorMultiToken = await getToken(operatorMultiUser.email);

      // prepare new user data
      const newOperatorMultiUser = structuredClone(operatorMultiUser);
      newOperatorMultiUser.email = 'not-allowed@redcross.nl';

      // attempt to create user
      const createUserResponse = await createUser(
        operatorMultiToken,
        newOperatorMultiUser,
      );

      // should return forbidden
      expect(createUserResponse.status).toBe(403);
    });
  });
}
