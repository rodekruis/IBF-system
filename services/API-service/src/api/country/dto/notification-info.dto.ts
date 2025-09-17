import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class NotificationInfoDto {
  @ApiProperty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty()
  public triggerStatement: object;

  @ApiProperty()
  @IsString()
  public linkSocialMediaType: string;

  @ApiProperty()
  @IsString()
  public linkSocialMediaUrl: string;

  @ApiProperty()
  @IsString()
  public linkVideo: string;

  @ApiProperty()
  @IsString()
  public linkPdf: string;

  @ApiProperty()
  @IsOptional()
  public useWhatsapp?: object;

  @ApiProperty()
  @IsOptional()
  public whatsappMessage?: object;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public externalEarlyActionForm?: string;
}
