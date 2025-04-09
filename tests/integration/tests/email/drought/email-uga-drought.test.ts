import { DroughtScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken } from '../../../helpers/utility.helper';
import { testDroughtScenario } from './test-drought-scenario.helper';

export default function emailUgaDroughtTests() {
  describe('Should send an email for UGA drought', () => {
    let accessToken: string;
    const countryCodeISO3 = 'UGA';

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    it('triggers in january', async () => {
      const dateJanuary = new Date(new Date().getFullYear(), 0, 2); // Use 2nd of January to avoid timezone issues
      const expectedEventNames = ['Mam', 'Karamoja'];
      const result = await testDroughtScenario(
        DroughtScenario.Trigger,
        countryCodeISO3,
        dateJanuary,
        expectedEventNames,
        accessToken,
      );
      expect(result).toBeTruthy();
    });

    it('warnings in january', async () => {
      const dateJanuary = new Date(new Date().getFullYear(), 0, 2); // Use 2nd of January to avoid timezone issues
      const expectedEventNames = ['Mam', 'Karamoja'];
      const result = await testDroughtScenario(
        DroughtScenario.Warning,
        countryCodeISO3,
        dateJanuary,
        expectedEventNames,
        accessToken,
      );
      expect(result).toBeTruthy();
    });

    it('non triggered any month', async () => {
      // Mock settings
      const currentDate = new Date();
      const expectedEventNames = [];
      const result = await testDroughtScenario(
        DroughtScenario.NoTrigger,
        countryCodeISO3,
        currentDate,
        expectedEventNames,
        accessToken,
      );
      expect(result).toBeTruthy();
    });
  });
}
