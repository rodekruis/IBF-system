import { FloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

export default function emailUgaFloodsTests() {
  describe('should send an email for uga floods', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';

    it('trigger', async () => {
      const events = [
        { eventName: 'G5075', leadTime: '0-day' },
        { eventName: 'G5220', leadTime: '4-day' },
        { eventName: 'G5230', leadTime: '6-day' },
      ];
      const result = await testFloodScenario(FloodsScenario.Trigger, {
        events,
        countryCodeISO3,
        token,
      });
      expect(result).toBeTruthy();
    });

    it('warning', async () => {
      const events = [{ eventName: 'G5230', leadTime: '5-day' }];
      const result = await testFloodScenario(FloodsScenario.Warning, {
        events,
        countryCodeISO3,
        token,
      });
      expect(result).toBeTruthy();
    });

    it('warning-to-trigger', async () => {
      const events = [{ eventName: 'G5220', leadTime: '4-day' }];
      const result = await testFloodScenario(FloodsScenario.WarningToTrigger, {
        events,
        countryCodeISO3,
        token,
      });
      expect(result).toBeTruthy();
    });

    it('no-trigger', async () => {
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
