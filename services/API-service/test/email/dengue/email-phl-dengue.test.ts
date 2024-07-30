import { EpidemicsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testDengueScenario } from './test-dengue-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl dengue', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    await testDengueScenario(
      EpidemicsScenario.Default,
      countryCodeISO3,
      accessToken,
    );
  });

  it('no-trigger', async () => {
    await testDengueScenario(
      EpidemicsScenario.NoTrigger,
      countryCodeISO3,
      accessToken,
    );
  });
});
