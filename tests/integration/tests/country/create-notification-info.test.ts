import { notificationInfoData } from '../../fixtures/notification-info.const';
import {
  addOrUpdateNotificationInfo,
  getCountries,
} from '../../helpers/country.helper';
import { getAccessToken, resetDB } from '../../helpers/utility.helper';

describe('create or update notification info', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('should update existing data successfully', async () => {
    // Arrange
    const newNotificationInfoData = structuredClone(notificationInfoData);
    const newLinkPdf = 'https://test-changed-link.com';
    newNotificationInfoData[0].linkPdf = newLinkPdf;
    const countryCodeISO3 = 'MWI';

    // Act
    const postResult = await addOrUpdateNotificationInfo(
      newNotificationInfoData,
      accessToken,
    );

    const getResult = await getCountries([countryCodeISO3], accessToken);

    // Assert
    expect(postResult.status).toBe(201);
    expect(getResult.status).toBe(200);
    expect(getResult.body[0].notificationInfo.linkPdf).toEqual(newLinkPdf);
  });

  it('should fail on unkown countryCodeISO3', async () => {
    // Arrange
    const newNotificationInfoData = structuredClone(notificationInfoData);
    newNotificationInfoData[0].countryCodeISO3 = 'XXX';

    // Act
    const postResult = await addOrUpdateNotificationInfo(
      newNotificationInfoData,
      accessToken,
    );

    // Assert
    expect(postResult.status).toBe(404);
  });
});
