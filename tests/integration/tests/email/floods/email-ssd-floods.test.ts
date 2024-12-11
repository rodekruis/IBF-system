import { FloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

const countryCodeISO3 = 'SSD';
describe('Should send an email for ssd floods', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  // Unskip when there is a need to test SSD in addition to UGA again
  it.skip('trigger', async () => {
    const events = [{ eventName: 'G5100', leadTime: '4-day' }];
    const result = await testFloodScenario(FloodsScenario.Trigger, {
      events,
      countryCodeISO3,
      accessToken,
    });
    expect(result).toBeTruthy();
  });

  it.skip('no-trigger', async () => {
    const events = [];
    const result = await testFloodScenario(FloodsScenario.NoTrigger, {
      events,
      countryCodeISO3,
      accessToken,
    });
    expect(result).toBeTruthy();
  });
});
