import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ example: 100 })
  public actionsValue: number;
}

export class EventSummaryCountry {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: new Date().toISOString() })
  public lastModelRunDate: string;

  @ApiProperty({ example: new Date().toISOString() })
  public startDate: string;

  @ApiProperty({ example: new Date().toISOString() })
  public startDateEvent: string;

  @ApiProperty({ example: new Date().toISOString() })
  public endDate: string;

  @ApiProperty({ example: true })
  public activeTrigger: boolean;

  @ApiProperty({ example: 'Mock typhoon' })
  public eventName: string;
}
