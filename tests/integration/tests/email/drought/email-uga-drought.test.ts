import { DroughtScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../../helpers/utility.helper';
import { testDroughtScenario } from './test-drought-scenario.helper';

export default function emailUgaDroughtTests() {
  describe('should send an email for UGA drought', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';

    it('triggers in january', async () => {
      const dateJanuary = new Date(new Date().getFullYear(), 0, 2); // Use 2nd of January to avoid timezone issues
      const expectedEventNames = ['Mam', 'Karamoja'];
      const result = await testDroughtScenario(
        DroughtScenario.Trigger,
        countryCodeISO3,
        dateJanuary,
        expectedEventNames,
        token,
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
        token,
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
        token,
      );
      expect(result).toBeTruthy();
    });
  });
}
