import { FloodsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import scenarios from '../../../src/scripts/mock-data/floods/ssd/scenarios.json';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

const countryCodeISO3 = 'SSD';
describe('Should send an email for ssd floods', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    // Arrange
    const scenario = FloodsScenario.Trigger;
    await testFloodScenario(scenario, {
      scenarios,
      countryCodeISO3,
      accessToken,
    });
  });

  it('no-trigger', async () => {
    // Arrange
    const scenario = FloodsScenario.NoTrigger;
    await testFloodScenario(scenario, {
      scenarios,
      countryCodeISO3,
      accessToken,
    });
  });
});
