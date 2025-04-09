import { FloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken } from '../../../helpers/utility.helper';
import { testFloodScenario } from './test-flood-scenario.helper';

export default function emailUgaFloodsTests() {
  const countryCodeISO3 = 'UGA';
  describe('Should send an email for uga floods', () => {
    let accessToken: string;

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    it('trigger', async () => {
      const events = [
        { eventName: 'G5075', leadTime: '0-day' },
        { eventName: 'G5220', leadTime: '4-day' },
        { eventName: 'G5230', leadTime: '6-day' },
      ];
      const result = await testFloodScenario(FloodsScenario.Trigger, {
        events,
        countryCodeISO3,
        accessToken,
      });
      expect(result).toBeTruthy();
    });

    it('warning', async () => {
      const events = [{ eventName: 'G5230', leadTime: '5-day' }];
      const result = await testFloodScenario(FloodsScenario.Warning, {
        events,
        countryCodeISO3,
        accessToken,
      });
      expect(result).toBeTruthy();
    });

    it('warning-to-trigger', async () => {
      const events = [{ eventName: 'G5220', leadTime: '4-day' }];
      const result = await testFloodScenario(FloodsScenario.WarningToTrigger, {
        events,
        countryCodeISO3,
        accessToken,
      });
      expect(result).toBeTruthy();
    });

    it('no-trigger', async () => {
      const events = [];
      const result = await testFloodScenario(FloodsScenario.NoTrigger, {
        events,
        countryCodeISO3,
        accessToken,
      });
      expect(result).toBeTruthy();
    });
  });
}
