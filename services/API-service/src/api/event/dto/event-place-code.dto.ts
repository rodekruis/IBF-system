import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';

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

  @ApiProperty({ example: 'Event A' })
  public eventName: string;

  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  public name: string;

  @ApiProperty({ example: new Date().toISOString() })
  public firstIssuedDate: string;

  @ApiProperty({ example: null })
  public endDate: string;

  @ApiProperty({ example: false })
  public stopped: boolean;

  @ApiProperty({ example: false })
  public manuallyStopped: boolean;

  @ApiProperty({ example: 'population_affected' })
  public exposureIndicator: string;

  @ApiProperty({ example: 100 })
  public exposureValue: number;

  @ApiProperty({ example: 'Maximum alert' })
  public alertClass: string;

  @ApiProperty({ example: '57084ea4-cac9-4f29-b955-fe9f08beb588' })
  public databaseId: string;

  constructor() {
    this.countryCodeISO3 = null;
    this.disasterType = null;
    this.eventName = null;
    this.placeCode = null;
    this.name = null;
    this.firstIssuedDate = null;
    this.endDate = null;
    this.stopped = null;
    this.manuallyStopped = null;
    this.exposureIndicator = null;
    this.exposureValue = null;
    this.alertClass = null;
    this.databaseId = null;
  }
}
