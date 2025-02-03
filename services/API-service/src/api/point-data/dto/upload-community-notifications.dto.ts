import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CommunityNotificationExternalDto {
  @ApiProperty({ example: 'nameVolunteer' })
  @IsNotEmpty()
  @IsString()
  nameVolunteer: string;

  @ApiProperty({ example: 'nameVillage' })
  nameVillage: string;

  @ApiProperty({ example: 'floods' })
  disasterType: string;

  @ApiProperty({ example: 'description' })
  description: string;

  @ApiProperty({ example: new Date() })
  end: Date;

  @ApiProperty({ example: [{ download_url: 'http://example.org' }] })
  _attachments: [{ download_url: string }];

  @ApiProperty({ example: [0, 0], description: 'latitude,longitude' })
  @IsNotEmpty()
  _geolocation: [number, number];
}

export class CommunityNotificationDto {
  @ApiProperty({ example: 'nameVolunteer' })
  @IsNotEmpty()
  @IsString()
  public nameVolunteer: string = undefined;

  @ApiProperty({ example: 'nameVillage' })
  public nameVillage: string = undefined;

  @ApiProperty({ example: 'description' })
  public description: string = undefined;

  @ApiProperty({ example: 'type' })
  public type: string = undefined;

  @ApiProperty({ example: new Date() })
  public uploadTime: Date = undefined;

  @ApiProperty({ example: 'https://www.url-of-photo.com' })
  public photoUrl: string = undefined;

  public dismissed = false;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
