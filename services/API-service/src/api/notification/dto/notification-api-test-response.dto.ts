export class NotificationApiTestResponseDto {
  activeEvents: NotificationApiTestResponseChannelDto;
  finishedEvents: NotificationApiTestResponseChannelDto;
}

export class NotificationApiTestResponseChannelDto {
  email: string;
  whatsapp: string;
}
