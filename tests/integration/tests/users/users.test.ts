import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { createUser, updateUser } from './users.api';

export default function manageUsersTests() {
  describe('users', () => {
    let adminToken: string;
    let otherUserId: string;

    const userData = {
      email: 'ibf-devops@redcross.nl',
      firstName: 'Test',
      lastName: 'User',
      userRole: UserRole.Operator,
      countryCodesISO3: [
        'UGA',
        'ZMB',
        'MWI',
        'SSD',
        'KEN',
        'ETH',
        'PHL',
        'ZWE',
      ],
      disasterTypes: [
        'floods',
        'malaria',
        'drought',
        'typhoon',
        'flash-floods',
      ],
      password: 'password',
    };

    describe('create user', () => {
      it('should create user', async () => {
        // Arrange
        adminToken = await getToken();

        // Act
        const createResult = await createUser(adminToken, userData);

        // Assert
        expect(createResult.status).toBe(201);
        expect(createResult.body.user.userRole).toBe(UserRole.Operator);
        // countries should be alphabetically sorted
        expect(createResult.body.user.countries).toStrictEqual(
          userData.countryCodesISO3.sort(),
        );
        // disaster types should be alphabetically sorted
        expect(createResult.body.user.disasterTypes).toStrictEqual(
          userData.disasterTypes.sort(),
        );

        // store other user id for update tests
        otherUserId = createResult.body.user.id;
      });

      it('should fail if email exists', async () => {
        // Act
        const createResult = await createUser(adminToken, userData);

        // Assert
        expect(createResult.status).toBe(400);
      });

      it('should fail if operator creates user', async () => {
        // Arrange
        const operatorToken = await getToken(userData.email);

        const newUserData = structuredClone(userData);
        newUserData.email = 'not-allowed@redcross.nl';

        // Act
        const createResult = await createUser(operatorToken, newUserData);

        // Assert
        expect(createResult.status).toBe(403);
      });
    });

    describe('update user', () => {
      it('should successfully update properties', async () => {
        // Arrange
        const newFirstName = 'new-first-name';
        const newUserRole = UserRole.Viewer;
        const userData = { firstName: newFirstName, userRole: newUserRole };

        // Act
        const updateUserResult = await updateUser(
          adminToken,
          userData,
          otherUserId,
        );

        // Assert
        expect(updateUserResult.status).toBe(200);
        expect(updateUserResult.body.user.firstName).toBe(newFirstName);
      });

      it('should throw NOT_FOUND on unknown user id', async () => {
        // Arrange
        const userId = '362c3dcb-9fe9-4f38-ae55-d0d6df7c5fc9';
        const userData = { lastName: 'new-last-name' };

        // Act
        const updateUserResult = await updateUser(adminToken, userData, userId);

        // Assert
        expect(updateUserResult.status).toBe(404);
      });
    });
  });
}
