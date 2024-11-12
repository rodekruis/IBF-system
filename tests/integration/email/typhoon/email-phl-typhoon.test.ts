import { TyphoonScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testTyphoonScenario } from './test-typhoon-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl typhoon', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it.skip('trigger', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});
