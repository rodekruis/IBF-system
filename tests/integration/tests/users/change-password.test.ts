import { userData } from '../../fixtures/users.const';
import {
  changePassword,
  getAccessToken,
  loginUser,
  resetDB,
} from '../../helpers/utility.helper';

describe('change password of user ..', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('successfully and log-in with it', async () => {
    // Arrange
    const newPassword = 'new-password';

    // Act
    const changePasswordResult = await changePassword(
      userData.email,
      newPassword,
      accessToken,
    );
    const loginResult = await loginUser(userData.email, newPassword);

    // Assert
    expect(changePasswordResult.status).toBe(201);
    expect(loginResult.status).toBe(201);

    // Clean up: change password back as subsequent tests will fail otherwise
    // REFACTOR: This is a code smell. We should not have to clean up after a test, but this is a pretty specific case.
    const changePasswordBackResult = await changePassword(
      userData.email,
      userData.password,
      accessToken,
    );
    expect(changePasswordBackResult.status).toBe(201);
  });

  it('fail for unrecognized user', async () => {
    // Arrange
    const email = 'unexisting-user@redcross.nl';
    const newPassword = 'new-password';

    // Act
    const changePasswordResult = await changePassword(
      email,
      newPassword,
      accessToken,
    );

    // Assert
    expect(changePasswordResult.status).toBe(404);
  });
});
