import { ApiProperty } from '@nestjs/swagger';

import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AlertLevel } from '../api/event/enum/alert-level.enum';
import { Geometry } from './geo.model';

export class AdminAreaRecord {
  public placeCode: string;
  public name: string;
  public geom: Geometry;
  public countryCodeISO3: string;
  public date: Date;
  public leadTime: string;
  public population_affected: number;
}

export class AggregateDataRecord {
  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: '21UGA001' })
  public placeCodeParent: string;

  @ApiProperty({ example: 'population_affected' })
  public indicator: string;

  @ApiProperty({ example: 100 })
  public value: number;
}

export class AlertArea {
  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  public name: string;

  @ApiProperty({ example: 'Agago' })
  public nameParent: string;

  @ApiProperty({ example: 'Event name' })
  public eventName: string;

  @ApiProperty({ example: 100 })
  public mainExposureValue: number;

  @ApiProperty({ example: 1 })
  public forecastSeverity: number;

  @ApiProperty({ example: false })
  public userTrigger: boolean;

  @ApiProperty({ example: AlertLevel.NONE })
  public alertLevel: AlertLevel;

  @ApiProperty({ example: new Date().toISOString() })
  public firstIssuedDate: string;

  @ApiProperty({ example: new Date().toISOString() })
  public userTriggerDate: string;

  @ApiProperty({ example: 'Henry Dunant' })
  public displayName: string;
}

export class EapAlertClass {
  key: EapAlertClassKeyEnum;
  label: string;
  color: string;
  value: number;
  textColor?: string;
}

export enum EapAlertClassKeyEnum {
  min = 'min',
  med = 'med',
  max = 'max',
  no = 'no',
}

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
  eapAlertClass?: EapAlertClass;
}

export class EventSummaryCountry {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: new Date() })
  public firstIssuedDate: Date;

  @ApiProperty({ example: new Date() })
  public endDate: Date;

  @ApiProperty({ example: true })
  public forecastTrigger: boolean;

  @ApiProperty({ example: false })
  public userTrigger: boolean;

  @ApiProperty({ example: 'Mock typhoon' })
  public eventName: string;

  @ApiProperty({ example: LeadTime.day3 })
  public firstLeadTime: LeadTime;

  @ApiProperty({ example: LeadTime.day5 })
  public firstTriggerLeadTime: LeadTime;

  @ApiProperty({ example: {} })
  public disasterSpecificProperties: DisasterSpecificProperties;

  @ApiProperty({ example: 100 })
  public forecastSeverity: number;

  @ApiProperty({ example: AlertLevel.NONE })
  public alertLevel: AlertLevel;

  @ApiProperty({ example: new Date() })
  public userTriggerDate: Date;

  @ApiProperty({ example: 'Henry Dunant' })
  public userTriggerName: string;

  @ApiProperty({ example: [] })
  public alertAreas?: AlertArea[];
}
