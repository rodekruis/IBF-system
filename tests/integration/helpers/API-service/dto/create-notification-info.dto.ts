export interface CreateNotificationInfoDto {
  countryCodeISO3: string;
  logo: object;
  triggerStatement: object;
  linkSocialMediaType: string;
  linkSocialMediaUrl: string;
  linkVideo: string;
  linkPdf: string;
  useWhatsapp?: object;
  whatsappMessage?: object;
  externalEarlyActionForm?: string;
}
