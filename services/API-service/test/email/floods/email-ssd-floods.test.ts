import { FloodsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

const countryCodeISO3 = 'SSD';
describe('Should send an email for ssd floods', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const events = [{ eventName: 'G5100', leadTime: '4-day' }];
    await testFloodScenario(FloodsScenario.Trigger, {
      events,
      countryCodeISO3,
      accessToken,
    });
  });

  it('no-trigger', async () => {
    const events = [];
    await testFloodScenario(FloodsScenario.NoTrigger, {
      events,
      countryCodeISO3,
      accessToken,
    });
  });
});
