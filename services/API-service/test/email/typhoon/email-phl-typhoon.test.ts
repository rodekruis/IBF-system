import { TyphoonScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testTyphoonScenario } from './test-typhoon-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl typhoon', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    await testTyphoonScenario(
      TyphoonScenario.EventTrigger,
      countryCodeISO3,
      accessToken,
    );
  });
});
