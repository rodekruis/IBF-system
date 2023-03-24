import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
