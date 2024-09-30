import { EpidemicsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testMalariaScenario } from './test-malaria-scenario.helper';

const countryCodeISO3 = 'ETH';
describe('Should send an email for eth malaria', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    await testMalariaScenario(
      EpidemicsScenario.Trigger,
      countryCodeISO3,
      accessToken,
    );
  });

  it('no-trigger', async () => {
    await testMalariaScenario(
      EpidemicsScenario.NoTrigger,
      countryCodeISO3,
      accessToken,
    );
  });
});
