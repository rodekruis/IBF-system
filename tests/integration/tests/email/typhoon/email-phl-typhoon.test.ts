import { TyphoonScenario } from '../../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../../helpers/utility.helper';
import { testTyphoonScenario } from './test-typhoon-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl typhoon', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('warning', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventNoTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('no landfall (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventNoLandfall,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('no landfall yet (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventNoLandfallYet,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('after landfall (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.EventAfterLandfall,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});
