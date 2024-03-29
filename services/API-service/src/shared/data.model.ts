import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';

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

export class TriggeredArea {
  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  public name: string;

  @ApiProperty({ example: 'Agago' })
  public nameParent: string;

  @ApiProperty({ example: 'Event name' })
  public eventName: string;

  @ApiProperty({ example: 100 })
  public actionsValue: number;

  @ApiProperty({ example: 1 })
  public triggerValue: number;

  @ApiProperty({ example: false })
  public stopped: boolean;

  @ApiProperty({ example: new Date().toISOString() })
  public startDate: string;

  @ApiProperty({ example: new Date().toISOString() })
  public stoppedDate: string;

  @ApiProperty({ example: 'Henry Dunant' })
  public displayName: string;
}

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
}

export class EventSummaryCountry {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: new Date().toISOString() })
  public startDate: string;

  @ApiProperty({ example: new Date().toISOString() })
  public endDate: string;

  @ApiProperty({ example: true })
  public activeTrigger: boolean;

  @ApiProperty({ example: true })
  public thresholdReached: boolean;

  @ApiProperty({ example: 'Mock typhoon' })
  public eventName: string;

  @ApiProperty({ example: LeadTime.day3 })
  public firstLeadTime: LeadTime;

  @ApiProperty({ example: LeadTime.day5 })
  public firstTriggerLeadTime: LeadTime;

  @ApiProperty({ example: {} })
  public disasterSpecificProperties: DisasterSpecificProperties;
}
