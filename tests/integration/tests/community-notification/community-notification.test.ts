import { CommunityNotificationExternalDto } from '../../helpers/API-service/dto/upload-community-notification.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { PointDataEnum } from '../../helpers/API-service/enum/point-data.enum';
import { getToken, mock } from '../../helpers/utility.helper';
import {
  dismissCommunityNotification,
  getPointData,
  postCommunityNotification,
} from './community-notification.api';

export default function communityNotificationTests() {
  describe('community notifications', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    it('should successfully post and get and dismiss a community notification', async () => {
      // Arrange
      const countryCodeISO3 = 'UGA';
      const disasterType = DisasterType.Floods;
      await mock(
        FloodsScenario.Trigger,
        DisasterType.Floods,
        countryCodeISO3,
        null,
        token,
      );

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
        token,
      );
      // TODO: also test the whatsapp message upon posting a new notification

      const getResult = await getPointData(
        countryCodeISO3,
        PointDataEnum.communityNotifications,
        disasterType,
        token,
      );

      const pointDataId = getResult.body.features[0].properties.pointDataId;
      const dismissResult = await dismissCommunityNotification(
        pointDataId,
        token,
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
}
