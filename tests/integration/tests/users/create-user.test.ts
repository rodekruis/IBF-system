import { userData } from '../../fixtures/users.const';
import {
  createUser,
  getAccessToken,
  loginUser,
  resetDB,
} from '../../helpers/utility.helper';
import { UserRole } from '../../helpers/API-service/enum/user-role.enum';

describe('create user', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('successfully, and log-in with it', async () => {
    // Arrange
    let newUserData = structuredClone(userData);
    newUserData.email = 'new-user@redcross.nl';
    newUserData.username = 'new-user';

    // Act
    const createResult = await createUser(newUserData, accessToken);
    const loginResult = await loginUser(
      createResult.body.user.email,
      newUserData.password,
    );

    // Assert
    expect(createResult.status).toBe(201);
    expect(createResult.body.user.userRole).toBe(UserRole.DisasterManager);

    expect(loginResult.status).toBe(201);
  });

  it('fails when email or username exists already', async () => {
    // Arrange
    let existingUserData = structuredClone(userData);

    // Act
    const createResult = await createUser(existingUserData, accessToken);

    // Assert
    expect(createResult.status).toBe(400);
  });
});
