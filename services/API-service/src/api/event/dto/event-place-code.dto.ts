import { ApiProperty } from '@nestjs/swagger';

import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { AlertLevel } from '../enum/alert-level.enum';

export class SetTriggerDto {
  @ApiProperty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  public eventPlaceCodeIds: string[];

  public countryCodeISO3: string;
  public disasterType: DisasterType;
  public noNotifications: boolean;
}

export class ActivationLogDto {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  public disasterType: string;

  @ApiProperty({ example: 'Event A' })
  public eventName: string;

  @ApiProperty({ example: 'UG3066' })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  public name: string;

  @ApiProperty({ example: new Date().toISOString() })
  public firstIssuedDate: string;

  @ApiProperty({ example: null })
  public endDate: string;

  @ApiProperty({ example: false })
  public userTrigger: boolean;

  @ApiProperty({ example: new Date().toISOString() })
  public userTriggerDate: string;

  @ApiProperty({ example: 'population_affected' })
  public exposureIndicator: string;

  @ApiProperty({ example: 100 })
  public exposureValue: number;

  @ApiProperty({ default: AlertLevel.NONE })
  public alertLevel: AlertLevel;

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
    this.userTrigger = null;
    this.userTriggerDate = null;
    this.exposureIndicator = null;
    this.exposureValue = null;
    this.alertLevel = AlertLevel.NONE;
    this.databaseId = null;
  }
}
