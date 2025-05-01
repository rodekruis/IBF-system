import { FloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

export default function emailSsdFloodsTests() {
  describe('should send an email for ssd floods', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'SSD';

    // Unskip when there is a need to test SSD in addition to UGA again
    it.skip('trigger', async () => {
      const events = [{ eventName: 'G5100', leadTime: '4-day' }];
      const result = await testFloodScenario(FloodsScenario.Trigger, {
        events,
        countryCodeISO3,
        token,
      });
      expect(result).toBeTruthy();
    });

    it.skip('no-trigger', async () => {
      const events = [];
      const result = await testFloodScenario(FloodsScenario.NoTrigger, {
        events,
        countryCodeISO3,
        token,
      });
      expect(result).toBeTruthy();
    });
  });
}
