import {
  getAccessToken,
  mockFloods,
  resetDB,
  sendNotification,
} from '../helpers/utility.helper';
import { FloodsScenario } from '../../src/scripts/enum/mock-scenario.enum';
import { DisasterType } from '../../src/api/disaster/disaster-type.enum';

describe('Should send an email for uga floods', () => {
  let accessToken: string;
  const countryCodeISO3 = 'UGA';

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('send trigger email default floods', async () => {
    // Arrange
    const mockResult = await mockFloods(
      FloodsScenario.Default,
      countryCodeISO3,
      accessToken,
    );
    // Act
    const response = await sendNotification(
      countryCodeISO3,
      DisasterType.Floods,
      accessToken,
    );

    // Assert
    // Also checking the status of the mockResult here as I think it also breaks often
    expect(mockResult.status).toBe(202);

    expect(response.status).toBe(201);
  });
});
