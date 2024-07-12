import { FloodsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import scenarios from '../../../src/scripts/mock-data/floods/uga/scenarios.json';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

const countryCodeISO3 = 'UGA';
describe('Should send an email for uga floods', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    // Arrange
    const scenario = FloodsScenario.Default;
    await testFloodScenario(scenario, {
      scenarios,
      countryCodeISO3,
      accessToken,
    });
  });

  it('warning', async () => {
    // Arrange
    const scenario = FloodsScenario.Warning;
    await testFloodScenario(scenario, {
      scenarios,
      countryCodeISO3,
      accessToken,
    });
  });

  it('warning-to-trigger', async () => {
    // Arrange
    const scenario = FloodsScenario.WarningToTrigger;
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
