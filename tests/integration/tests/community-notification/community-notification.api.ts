import { CommunityNotificationExternalDto } from '../../helpers/API-service/dto/upload-community-notification.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { PointDataEnum } from '../../helpers/API-service/enum/point-data.enum';
import { api } from '../../helpers/utility.helper';

export function postCommunityNotification(
  countryCodeISO3: string,
  uploadCommunityNotificationDto: CommunityNotificationExternalDto,
  token: string,
) {
  return api(token)
    .post(`/point-data/community-notification/${countryCodeISO3}`)
    .send(uploadCommunityNotificationDto);
}

export function dismissCommunityNotification(
  pointDataId: string,
  token: string,
) {
  return api(token).put(`/point-data/community-notification/${pointDataId}`);
}

export function getPointData(
  countryCodeISO3: string,
  pointDataCategory: PointDataEnum,
  disasterType: DisasterType,
  token: string,
) {
  return api(token)
    .get(`/point-data/${pointDataCategory}/${countryCodeISO3}`)
    .query({ disasterType });
}
