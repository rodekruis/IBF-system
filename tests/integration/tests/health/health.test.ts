import { api } from '../../helpers/utility.helper';

export default function healthTests(token: string) {
  describe('health', () => {
    it('should return API working', async () => {
      // Act
      const healthCheck = await api(token).get('/');

      // Assert
      expect(healthCheck.status).toBe(200);
      expect(healthCheck.body).toBe('API working');
    });

    it('should return 403 Forbidden without token', async () => {
      // Act
      const healthCheck = await api().get('/authentication');

      // Assert
      expect(healthCheck.status).toBe(403);
      expect(healthCheck.body).toMatchObject({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    });

    it('should return 403 Forbidden without invalid token', async () => {
      // Arrange
      const invalidToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMmZlNTI4YS04YjEwLTRhMDMtOWFjOC1lNTdlNzE4MWY1YmEiLCJlbWFpbCI6ImR1bmFudEByZWRjcm9zcy5ubCIsImZpcnN0TmFtZSI6IkhlbnJ5IiwibWlkZGxlTmFtZSI6bnVsbCwibGFzdE5hbWUiOiJEdW5hbnQiLCJ1c2VyUm9sZSI6ImFkbWluIiwiY291bnRyaWVzIjpbIlVHQSIsIlpNQiIsIk1XSSIsIlNTRCIsIktFTiIsIkVUSCIsIlBITCIsIlpXRSIsIkxTTyJdLCJkaXNhc3RlclR5cGVzIjpbImZsb29kcyIsIm1hbGFyaWEiLCJkcm91Z2h0IiwidHlwaG9vbiIsImZsYXNoLWZsb29kcyJdLCJleHAiOjE3NTEyODMwNDUuOTU1LCJpYXQiOjE3NDYwOTkwNDV9.6Woam28m4ERHY8vRBo5scTNSpHNmlHLbZqcoEZNaRlo';

      // Act
      const healthCheck = await api(invalidToken).get('/authentication');

      // Assert
      expect(healthCheck.status).toBe(403);
      expect(healthCheck.body).toMatchObject({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    });

    it('should return API authentication working', async () => {
      // Act
      const healthCheck = await api(token).get('/authentication');

      // Assert
      expect(healthCheck.status).toBe(200);
      expect(healthCheck.body).toBe('API authentication working');
    });

    it('should return database status', async () => {
      // Act
      const healthCheck = await api(token).get('/health');

      // Assert
      expect(healthCheck.status).toBe(200);
      expect(healthCheck.body).toMatchObject({ database: { status: 'up' } });
    });
  });
}
