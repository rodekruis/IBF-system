import { CommunityNotificationExternalDto } from '../../helpers/API-service/dto/upload-community-notification.dto';
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
