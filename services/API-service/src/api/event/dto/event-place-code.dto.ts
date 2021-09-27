import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisasterType } from '../../disaster/disaster-type.enum';

export class EventPlaceCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public eventPlaceCodeId: string;
}

export class ActivationLogDto {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  public disasterType: string;

  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  public name: string;

  @ApiProperty({ example: new Date().toISOString() })
  public startDate: string;

  @ApiProperty({ example: null })
  public endDate: string;

  @ApiProperty({ example: false })
  public closed: boolean;

  @ApiProperty({ example: false })
  public manuallyClosed: boolean;

  @ApiProperty({ example: 'population_affected' })
  public exposureIndicator: string;

  @ApiProperty({ example: 100 })
  public exposureValue: number;

  @ApiProperty({ example: '57084ea4-cac9-4f29-b955-fe9f08beb588' })
  public databaseId: string;
}
