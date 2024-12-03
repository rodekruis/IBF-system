import { FlashFloodsScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';
import { testFlashFloodScenario } from './test-flash-flood-scenario.helper';

const countryCodeISO3 = 'MWI';
describe('Should send an email for mwi flash flood', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const eventNames = ['Blantyre City', 'Karonga']; // Scneario contains also 'Rumphi' but as ongoing, for which no email is sent
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.Trigger,
      countryCodeISO3,
      eventNames,
      accessToken,
    );
    expect(result).toBeTruthy();
  }, 150000); //Increase timeout to 150 seconds, because mock takes long for this scenario

  it('no-trigger', async () => {
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.NoTrigger,
      countryCodeISO3,
      [],
      accessToken,
    );
    expect(result).toBeTruthy();
  });
});
