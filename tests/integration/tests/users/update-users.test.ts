import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser, updateUser } from './users.api';

export default function updateUsersTests() {
  describe('update users', () => {
    let adminToken: string;
    const userId: Partial<Record<keyof typeof userData, string>> = {};
    const token: Partial<Record<keyof typeof userData, string>> = {};

    beforeAll(async () => {
      adminToken = await getToken();

      // create users
      for (const userDataKey of Object.keys(userData)) {
        const createUserResponse = await createUser(
          adminToken,
          userData[userDataKey],
        );

        userId[userDataKey] = createUserResponse.body.user.userId;
        token[userDataKey] = await getToken(userData[userDataKey].email);
      }
    });

    afterAll(async () => {
      for (const userDataKey of Object.keys(userData)) {
        await deleteUser(adminToken, userId[userDataKey]);

        delete userId[userDataKey];
        delete token[userDataKey];
      }
    });

    it('should update own first name, last name, whatsapp, and disaster types', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = {
        firstName: userData[userDataKey].firstName + 'x',
        middleName: 'van',
        lastName: userData[userDataKey].lastName + 'x',
        whatsappNumber: '+31647428590',
        disasterTypes: ['flash-floods'],
      };

      // update user
      const updateUserResponse = await updateUser(
        token[userDataKey]!,
        updateUserData,
      );

      // should return ok
      expect(updateUserResponse.status).toBe(200);
      // first name should be updated
      expect(updateUserResponse.body.user.firstName).toBe(
        updateUserData.firstName,
      );
      // middle name should be updated
      expect(updateUserResponse.body.user.middleName).toBe(
        updateUserData.middleName,
      );
      // last name should be updated
      expect(updateUserResponse.body.user.lastName).toBe(
        updateUserData.lastName,
      );
      // whatsapp number should be updated
      expect(updateUserResponse.body.user.whatsappNumber).toBe(
        updateUserData.whatsappNumber,
      );
      // disaster types should be updated
      expect(updateUserResponse.body.user.disasterTypes).toStrictEqual(
        updateUserData.disasterTypes,
      );
      // token should be valid
      expect(updateUserResponse.body.user.token.indexOf('eyJ')).toBe(0);
    });

    it('should not update email', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = { email: userData[userDataKey].email + 'x' };

      // update user
      const updateUserResult = await updateUser(
        token['admin-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // email should not be updated
      expect(updateUserResult.body.user.email).toBe(
        userData[userDataKey].email,
      );
    });

    it('should not update own email or user role or countries', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = {
        email: userData[userDataKey].email + 'x',
        userRole: UserRole.Viewer,
        countryCodesISO3: ['PHL', 'ETH'],
      };

      // update user
      const updateUserResult = await updateUser(
        token[userDataKey]!,
        updateUserData,
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // email should not be updated
      expect(updateUserResult.body.user.email).toBe(
        userData[userDataKey].email,
      );
      // user role should not be updated
      expect(updateUserResult.body.user.userRole).toBe(
        userData[userDataKey].userRole,
      );
      // countries should not be updated
      expect(updateUserResult.body.user.countryCodesISO3.sort()).toStrictEqual(
        userData[userDataKey].countryCodesISO3.sort(),
      );
    });

    it('should update other users first name, last name, user role, whatsapp, countries, and disaster types', async () => {
      // pick user to update
      const userDataKey = 'operator-uganda';

      // prepare data for update
      const updateUserData = {
        firstName: userData[userDataKey].firstName + 'x',
        middleName: 'van',
        lastName: userData[userDataKey].lastName + 'x',
        userRole: UserRole.Viewer,
        whatsappNumber: '+31647428590',
        countryCodesISO3: ['PHL', 'ETH'],
        disasterTypes: ['typhoon', 'drought'],
      };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // first name should be updated
      expect(updateUserResult.body.user.firstName).toBe(
        updateUserData.firstName,
      );
      // middle name should be updated
      expect(updateUserResult.body.user.middleName).toBe(
        updateUserData.middleName,
      );
      // last name should be updated
      expect(updateUserResult.body.user.lastName).toBe(updateUserData.lastName);
      // user role should be updated
      expect(updateUserResult.body.user.userRole).toBe(updateUserData.userRole);
      // whatsapp number should be updated
      expect(updateUserResult.body.user.whatsappNumber).toBe(
        updateUserData.whatsappNumber,
      );
      // countries should be updated and sorted
      expect(updateUserResult.body.user.countryCodesISO3).toStrictEqual(
        updateUserData.countryCodesISO3.sort(),
      );
      // disaster types should be updated
      expect(updateUserResult.body.user.disasterTypes.sort()).toStrictEqual(
        updateUserData.disasterTypes.sort(),
      );
      // token should be null
      expect(updateUserResult.body.user.token).toBeNull();
    });

    it('should error if other user update if not admin', async () => {
      // pick user to update
      const userDataKey = 'viewer-multi';

      // prepare data for update
      const updateUserData = {
        firstName: userData[userDataKey].firstName + 'x',
      };

      // update user
      const updateUserResult = await updateUser(
        token['operator-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return forbidden
      expect(updateUserResult.status).toBe(403);
    });

    it('should error if other user update if not admin (also for own user id)', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = {
        firstName: userData[userDataKey].firstName + 'x',
      };

      // update user
      const updateUserResult = await updateUser(
        token['operator-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return forbidden
      expect(updateUserResult.status).toBe(403);
    });

    it('should error if user update in other country', async () => {
      // pick user to update
      const userDataKey = 'local-admin-uganda';

      // prepare data for update
      const updateUserData = { firstName: userData[userDataKey].email + 'x' };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-philippines']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return forbidden
      expect(updateUserResult.status).toBe(403);
    });

    it('should remove user from admin countries', async () => {
      // pick user to update
      const userDataKey = 'operator-uganda-drought';

      // admin removes user from all countries
      const updateUserData = { countryCodesISO3: [] };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-eastern-africa']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // countries should be updated
      expect(updateUserResult.body.user.countryCodesISO3).toStrictEqual(
        updateUserData.countryCodesISO3,
      );
    });

    it('should not remove user from non-admin countries', async () => {
      // pick user to update
      const userDataKey = 'operator-uganda';

      // admin removes user from all countries
      const updateUserData = { countryCodesISO3: [] };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-northern-africa']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return forbidden
      expect(updateUserResult.status).toBe(403);
    });

    it('should add user to own countries', async () => {
      // pick user to update
      const userDataKey = 'operator-philippines';

      // prepare data for update
      const updateUserData = { countryCodesISO3: ['EGY', 'MAR'] };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-northern-africa']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // countries should be updated and sorted
      expect(updateUserResult.body.user.countryCodesISO3).toStrictEqual(
        [
          ...userData[userDataKey].countryCodesISO3,
          ...updateUserData.countryCodesISO3,
        ].sort(),
      );
    });

    it('should error if user role is higher than own', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = { userRole: UserRole.Admin };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(403);
    });

    it('should update user role to same as own user role', async () => {
      // pick user to update
      const userDataKey = 'operator-multi';

      // prepare data for update
      const updateUserData = { userRole: UserRole.LocalAdmin };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return ok
      expect(updateUserResult.status).toBe(200);
      // user role should be updated
      expect(updateUserResult.body.user.userRole).toBe(updateUserData.userRole);
    });

    it('should error if user has user role higher than own', async () => {
      // pick user to update
      const userDataKey = 'admin-multi';

      // prepare data for update
      const updateUserData = {
        firstName: userData[userDataKey].firstName + 'x',
      };

      // update user
      const updateUserResult = await updateUser(
        token['local-admin-multi']!,
        updateUserData,
        userId[userDataKey],
      );

      // should return forbidden
      expect(updateUserResult.status).toBe(403);
    });

    it('should error if update unknown user', async () => {
      // use a random user id which does not exist
      const invalidUserId = '362c3dcb-9fe9-4f38-ae55-d0d6df7c5fc9';

      // attempt to update user
      const updateUserResult = await updateUser(
        adminToken,
        { lastName: 'new-last-name' },
        invalidUserId,
      );

      // should return not found
      expect(updateUserResult.status).toBe(404);
    });
  });
}
