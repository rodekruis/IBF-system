import { CommunityNotificationExternalDto } from '../../helpers/API-service/dto/upload-community-notification.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { PointDataEnum } from '../../helpers/API-service/enum/point-data.enum';
import {
  dismissCommunityNotification,
  getAccessToken,
  getPointData,
  mockFloods,
  postCommunityNotification,
  resetDB,
} from '../../helpers/utility.helper';

describe('community notifications', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('should successfully post and get and dismiss a community notification', async () => {
    // Arrange
    const countryCodeISO3 = 'UGA';
    const disasterType = DisasterType.Floods;
    await mockFloods(FloodsScenario.Trigger, countryCodeISO3, accessToken);

    const mockCommunityNotification: CommunityNotificationExternalDto = {
      nameVolunteer: 'nameVolunteer',
      nameVillage: 'nameVillage',
      disasterType: 'floods',
      description: 'description',
      end: new Date('2025-02-03T08:24:12.486Z'),
      _attachments: [
        {
          download_url:
            'https://fastly.picsum.photos/id/436/200/300.jpg?hmac=OuJRsPTZRaNZhIyVFbzDkMYMyORVpV86q5M8igEfM3Y',
        },
      ],
      _geolocation: [1, 33],
    };

    // Act
    const postResult = await postCommunityNotification(
      countryCodeISO3,
      mockCommunityNotification,
      accessToken,
    );

    const getResult = await getPointData(
      countryCodeISO3,
      PointDataEnum.communityNotifications,
      disasterType,
      accessToken,
    );

    const pointDataId = getResult.body.features[0].properties.pointDataId;
    const dismissResult = await dismissCommunityNotification(
      pointDataId,
      accessToken,
    );

    // Assert
    expect(postResult.status).toBe(201);

    expect(getResult.status).toBe(200);
    expect(getResult.body.features.length).toBe(1);
    expect(getResult.body.features[0].properties.nameVolunteer).toEqual(
      mockCommunityNotification.nameVolunteer,
    );

    expect(dismissResult.status).toBe(200);
  });
});
