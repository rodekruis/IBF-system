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

  it('api-test', async () => {
    const eventNames = ['Karonga']; // Scenario contains also 'Rumphi' but as ongoing, for which no email is sent
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.ApiTest,
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
