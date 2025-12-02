import { UserRole } from '@helpers/API-service/enum/user-role.enum';
import { getToken } from '@helpers/utility.helper';

import { userData } from '../../fixtures/users.const';
import { createUser, deleteUser, readUser } from './users.api';

export default function deleteUserTests() {
  describe('delete users', () => {
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
      for (const userRoleIndex in userRoles) {
        // skip viewer as it is deleted in test
        if (userRoles[userRoleIndex] === UserRole.Viewer) {
          continue;
        }

        const userRole = userRoles[userRoleIndex];
        const userDataKey = `${userRole}-multi`;

        await deleteUser(adminToken, userId[userDataKey]);
        delete userId[userDataKey];
      }
    });

    it('should error for viewer', async () => {
      const token = await getToken(userData['viewer-multi'].email);
      const deleteUserResponse = await deleteUser(
        token,
        userId['viewer-multi']!,
      );

      // should be forbidden
      expect(deleteUserResponse.status).toBe(403);

      // user should exist
      const readUserResponse = await readUser(adminToken);

      expect(readUserResponse.status).toBe(200);
      expect(readUserResponse.body.length).toBe(5);
    });

    it('should error for pipeline', async () => {
      const token = await getToken(userData['pipeline-multi'].email);
      const deleteUserResponse = await deleteUser(
        token,
        userId['viewer-multi']!,
      );

      // should be forbidden
      expect(deleteUserResponse.status).toBe(403);

      // user should exist
      const readUserResponse = await readUser(adminToken);

      expect(readUserResponse.status).toBe(200);
      expect(readUserResponse.body.length).toBe(5);
    });

    it('should error for operator', async () => {
      const token = await getToken(userData['operator-multi'].email);
      const deleteUserResponse = await deleteUser(
        token,
        userId['viewer-multi']!,
      );

      // should be forbidden
      expect(deleteUserResponse.status).toBe(403);

      // user should exist
      const readUserResponse = await readUser(adminToken);

      expect(readUserResponse.status).toBe(200);
      expect(readUserResponse.body.length).toBe(5);
    });

    it('should error for local-admin', async () => {
      const token = await getToken(userData['local-admin-multi'].email);
      const deleteUserResponse = await deleteUser(
        token,
        userId['viewer-multi']!,
      );

      // should be forbidden
      expect(deleteUserResponse.status).toBe(403);

      // user should exist
      const readUserResponse = await readUser(adminToken);

      expect(readUserResponse.status).toBe(200);
      expect(readUserResponse.body.length).toBe(5);
    });

    it('should delete for admin', async () => {
      const token = await getToken(userData['admin-multi'].email);
      const deleteUserResponse = await deleteUser(
        token,
        userId['viewer-multi']!,
      );

      // should succeed
      expect(deleteUserResponse.status).toBe(204);

      // user should not exist
      const readUserResponse = await readUser(adminToken);

      expect(readUserResponse.status).toBe(200);
      expect(readUserResponse.body.length).toBe(4); // one less user
    });
  });
}
