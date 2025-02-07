export interface CommunityNotificationExternalDto {
  nameVolunteer: string;
  nameVillage: string;
  disasterType: string;
  description: string;
  end: Date;
  _attachments: [{ download_url: string }];
  _geolocation: [number, number];
}
