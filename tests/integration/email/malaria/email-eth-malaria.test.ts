import { EpidemicsScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testMalariaScenario } from './test-malaria-scenario.helper';

const countryCodeISO3 = 'ETH';
describe('Should send an email for eth malaria', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it.skip('trigger', async () => {
    const result = await testMalariaScenario(
      EpidemicsScenario.Trigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it.skip('no-trigger', async () => {
    const result = await testMalariaScenario(
      EpidemicsScenario.NoTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});
