import { UserRole } from '@helpers/API-service/enum/user-role.enum';

import { login } from './login.api';

export default function loginTests() {
  describe('login', () => {
    it('should return prompt message with valid email', async () => {
      // arrange
      const email = 'test-user@redcross.nl';

      // act
      const loginResult = await login(email);

      // assert
      expect(loginResult.status).toBe(201);

      expect(loginResult.body.message).toBe(
        'Enter the code sent to your email',
      );
    });

    it('should return error message with invalid email', async () => {
      // arrange
      const email = '123';

      // act
      const loginResult = await login(email);

      // assert
      expect(loginResult.status).toBe(400);

      expect(loginResult.body.message).toBe('Something went wrong');
    });

    it('should return user with valid email and valid code', async () => {
      // arrange
      const email = 'test-user@redcross.nl';
      const loginResult = await login(email);
      expect(loginResult.status).toBe(201);

      // act
      const codeResult = await login(email, loginResult.body.code);

      // assert
      expect(codeResult.status).toBe(200);
      expect(codeResult.body.user.email).toBe(email);
      expect(codeResult.body.user.firstName).toMatch(/\w+/);
      expect(codeResult.body.user.middleName).toBeNull();
      expect(codeResult.body.user.lastName).toBe(UserRole.Viewer);
      expect(codeResult.body.user.userRole).toBe(UserRole.Viewer);
      expect(codeResult.body.user.whatsappNumber).toBeNull();
      expect(codeResult.body.user.token).toMatch(/ey\w+/);
    });

    it('should return prompt message with valid email and invalid code', async () => {
      // arrange
      const email = 'test-user@redcross.nl';
      const loginResult = await login(email);
      expect(loginResult.status).toBe(201);

      // act
      const codeResult = await login(email, 510510);

      // assert
      expect(codeResult.status).toBe(401);
      expect(codeResult.body.message).toBe('Enter the code sent to your email');
    });
  });
}
