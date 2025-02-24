import { FlashFloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, resetDB } from '../../../helpers/utility.helper';
import { testFlashFloodScenario } from './test-flash-flood-scenario.helper';

const countryCodeISO3 = 'MWI';
describe('Should send an email for mwi flash flood', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('trigger', async () => {
    const eventNames = ['Blantyre City', 'Karonga', 'Rumphi'];
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.Trigger,
      countryCodeISO3,
      eventNames,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('trigger-blantyre', async () => {
    const eventNames = ['Blantyre City'];
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.TriggerBlantyre,
      countryCodeISO3,
      eventNames,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('warning-karonga', async () => {
    const eventNames = ['Karonga'];
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.WarningKaronga,
      countryCodeISO3,
      eventNames,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

  it('trigger-ongoing-rumphi', async () => {
    const eventNames = ['Rumphi'];
    const result = await testFlashFloodScenario(
      FlashFloodsScenario.TriggerOngoingRumphi,
      countryCodeISO3,
      eventNames,
      accessToken,
    );
    expect(result).toBeTruthy();
  });

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
