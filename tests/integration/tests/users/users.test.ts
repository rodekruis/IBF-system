import { userData } from '../../fixtures/users.const';
import { UserRole } from '../../helpers/API-service/enum/user-role.enum';
import { getToken } from '../../helpers/utility.helper';
import { changePassword, createUser, login, updateUser } from './users.api';

export default function manageUsersTests() {
  describe('users', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    describe('create user', () => {
      it('should create user successfully and log-in with it', async () => {
        // Arrange
        const newUserData = structuredClone(userData);
        newUserData.email = 'new-user@redcross.nl';

        // Act
        const createResult = await createUser(newUserData, token);
        const loginResult = await login(
          createResult.body.user.email,
          newUserData.password,
        );

        // Assert
        expect(createResult.status).toBe(201);
        expect(createResult.body.user.userRole).toBe(UserRole.Operator);

        expect(loginResult.status).toBe(201);
      });

      it('should fail when email already exists', async () => {
        // Arrange
        const existingUserData = structuredClone(userData);

        // Act
        const createResult = await createUser(existingUserData, token);

        // Assert
        expect(createResult.status).toBe(400);
      });
    });

    describe('update user properties', () => {
      it('should successfully update properties', async () => {
        // Arrange
        const email = userData.email;
        const newFirstName = 'new-first-name';
        const newUserRole = UserRole.Operator; // Don't actually change the role, to not mess up other tests, but at least test that it is possible
        const updatedData = { firstName: newFirstName, role: newUserRole };

        // Act
        const updateUserResult = await updateUser(email, updatedData, token);

        // Assert
        expect(updateUserResult.status).toBe(200);
        expect(updateUserResult.body.user.firstName).toBe(newFirstName);
      });

      it('should throw NOT_FOUND on unknown email', async () => {
        // Arrange
        const email = 'unkown-email@redcross.nl';
        const updatedData = { firstName: 'new-first-name' };

        // Act
        const updateUserResult = await updateUser(email, updatedData, token);

        // Assert
        expect(updateUserResult.status).toBe(404);
      });

      it('should throw BAD_REQUEST on no passed arguments', async () => {
        // Arrange
        const email = userData.email;
        const updatedData = {};

        // Act
        const updateUserResult = await updateUser(email, updatedData, token);

        // Assert
        expect(updateUserResult.status).toBe(400);
      });
    });

    describe('change password', () => {
      it('should fail for unrecognized user', async () => {
        // Arrange
        const email = 'unexisting-user@redcross.nl';
        const newPassword = 'new-password';

        // Act
        const changePasswordResult = await changePassword(
          email,
          newPassword,
          token,
        );

        // Assert
        expect(changePasswordResult.status).toBe(404);
      });

      // Make sure this test is last in its beforeAll block, as it changes the password, which would make subsequent tests fail
      it('should successfully change password and log-in with it', async () => {
        // Arrange
        const newPassword = 'new-password';

        // Act
        const changePasswordResult = await changePassword(
          userData.email,
          newPassword,
          token,
        );
        const loginResult = await login(userData.email, newPassword);

        // Assert
        expect(changePasswordResult.status).toBe(201);
        expect(loginResult.status).toBe(201);

        // Clean up: change password back as subsequent tests will fail otherwise
        // REFACTOR: This is a code smell. We should not have to clean up after a test, but this is a pretty specific case.
        const changePasswordBackResult = await changePassword(
          userData.email,
          userData.password,
          token,
        );
        expect(changePasswordBackResult.status).toBe(201);
      });
    });
  });
}
