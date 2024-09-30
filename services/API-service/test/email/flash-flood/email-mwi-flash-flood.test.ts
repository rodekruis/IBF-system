import { FlashFloodsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testFlashFloodScenario } from './test-flash-flood-scenario.helper';

const countryCodeISO3 = 'MWI';
describe('Should send an email for mwi flash flood', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    await testFlashFloodScenario(
      FlashFloodsScenario.Trigger,
      countryCodeISO3,
      accessToken,
    );
  });

  it('no-trigger', async () => {
    await testFlashFloodScenario(
      FlashFloodsScenario.NoTrigger,
      countryCodeISO3,
      accessToken,
    );
  });
});
