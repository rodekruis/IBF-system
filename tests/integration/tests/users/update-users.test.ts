import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser, updateUser } from './users.api';

export default function updateUsersTests() {
  describe('update users', () => {
    let token: string;
    let operatorMultiUserId: string;
    const operatorMultiUser = userData['operator-multi'];

    beforeAll(async () => {
      token = await getToken();
    });

    afterAll(async () => {
      await deleteUser(token, operatorMultiUserId);
    });

    it('should update first name and role', async () => {
      // create user to update
      const createUserResponse = await createUser(token, operatorMultiUser);
      // check if user is created
      expect(createUserResponse.status).toBe(201);
      operatorMultiUserId = createUserResponse.body.user.userId;

      // prepare data for update
      const updateOperatorMultiUser = {
        firstName: 'new-first-name',
        userRole: UserRole.Viewer,
      };

      // update user
      const updateUserResult = await updateUser(
        token,
        updateOperatorMultiUser,
        operatorMultiUserId,
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // first name should be updated
      expect(updateUserResult.body.user.firstName).toBe(
        updateOperatorMultiUser.firstName,
      );
      // user role should be updated
      expect(updateUserResult.body.user.userRole).toBe(
        updateOperatorMultiUser.userRole,
      );
    });

    it('should fail to update unknown user', async () => {
      // use a random user id which does not exist
      const invalidUserId = '362c3dcb-9fe9-4f38-ae55-d0d6df7c5fc9';

      // attempt to update user
      const updateUserResult = await updateUser(
        token,
        { lastName: 'new-last-name' },
        invalidUserId,
      );

      // should return not found
      expect(updateUserResult.status).toBe(404);
    });
  });
}
