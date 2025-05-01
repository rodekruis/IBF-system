import { TyphoonScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../../helpers/utility.helper';
import { testTyphoonScenario } from './test-typhoon-scenario.helper';

export default function emailPhlTyphoonTests() {
  describe('should send an email for phl typhoon', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'PHL';

    it('trigger', async () => {
      const result = await testTyphoonScenario(
        TyphoonScenario.Trigger,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });

    it('warning', async () => {
      const result = await testTyphoonScenario(
        TyphoonScenario.Warning,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });

    it('no landfall (trigger)', async () => {
      const result = await testTyphoonScenario(
        TyphoonScenario.NoLandfallTrigger,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });

    it('no landfall yet (trigger)', async () => {
      const result = await testTyphoonScenario(
        TyphoonScenario.NoLandfallYetWarning,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });

    it('after landfall (trigger)', async () => {
      const result = await testTyphoonScenario(
        TyphoonScenario.OngoingTrigger,
        countryCodeISO3,
        token,
      );
      expect(result).toBeTruthy();
    });
  });
}
