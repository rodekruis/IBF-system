import { EpidemicsScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testDengueScenario } from './test-dengue-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl dengue', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const result = await testDengueScenario(
      EpidemicsScenario.Trigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('no-trigger', async () => {
    const result = await testDengueScenario(
      EpidemicsScenario.NoTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});