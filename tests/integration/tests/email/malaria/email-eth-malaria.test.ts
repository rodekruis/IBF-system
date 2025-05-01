import { MalariaScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../../helpers/utility.helper';
import { testMalariaScenario } from './test-malaria-scenario.helper';

export default function emailEthMalariaTests() {
  describe('should send an email for eth malaria', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'ETH';

    // Unskip when malaria is switched on again
    it.skip('trigger', async () => {
      const result = await testMalariaScenario(
        MalariaScenario.Trigger,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });

    it.skip('no-trigger', async () => {
      const result = await testMalariaScenario(
        MalariaScenario.NoTrigger,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });
  });
}
