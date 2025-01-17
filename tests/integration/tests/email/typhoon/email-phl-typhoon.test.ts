import { TyphoonScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../../helpers/utility.helper';
import { testTyphoonScenario } from './test-typhoon-scenario.helper';

const countryCodeISO3 = 'PHL';
describe('Should send an email for phl typhoon', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.Trigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('warning', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.Warning,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('no landfall (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.NoLandfallTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('no landfall yet (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.NoLandfallYetWarning,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('after landfall (trigger)', async () => {
    const result = await testTyphoonScenario(
      TyphoonScenario.OngoingTrigger,
      countryCodeISO3,
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});
