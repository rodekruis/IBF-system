import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationInfoDto {
  @ApiProperty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty()
  @IsString()
  public logo: string;

  @ApiProperty()
  public triggerStatement: JSON;

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
  @IsBoolean()
  public useWhatsapp: boolean;

  @ApiProperty()
  @IsOptional()
  public whatsappMessage: JSON;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public externalEarlyActionForm: string;
}
