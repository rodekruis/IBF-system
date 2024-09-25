import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { NumberFormat } from '../../shared/enums/number-format.enum';

@Entity('indicator-metadata')
export class IndicatorMetadataEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('json', {
    default: {},
  })
  public countryDisasterTypes: JSON;

  @ApiProperty()
  @Column()
  public name: string;

  @ApiProperty()
  @Column()
  public label: string;

  @ApiProperty({ example: 'logo.svg' })
  @Column()
  public icon: string;

  @ApiProperty({ example: true })
  @Column()
  public weightedAvg: boolean;

  @ApiProperty({ example: 'total_houses' })
  @Column({ nullable: true })
  public weightVar: string;

  @ApiProperty({ example: 'yes' })
  @Column()
  public active: string;

  @ApiProperty({
    example: {
      '1': { label: 'Very Low', valueLow: 0, valueHigh: 2 },
      '2': { label: 'Low', valueLow: 2, valueHigh: 4 },
      '3': { label: 'Average', valueLow: 4, valueHigh: 6 },
      '4': { label: 'High', valueLow: 6, valueHigh: 8 },
      '5': { label: 'Very High', valueLow: 8, valueHigh: 10 },
    },
  })
  @Column('json', { nullable: true })
  public colorBreaks: JSON;

  @ApiProperty({ example: NumberFormat.decimal0 })
  @Column()
  public numberFormatMap: NumberFormat;

  @ApiProperty({ example: 'decimal0' })
  @Column()
  public numberFormatAggregate: string;

  @ApiProperty()
  @Column({ default: 1 })
  public order: number;

  @ApiProperty()
  @Column({ default: false })
  public dynamic: boolean;

  @ApiProperty({ example: 'people' })
  @Column({ nullable: true })
  public unit: string;

  @ApiProperty({ example: 'km' })
  @Column({ nullable: true })
  public aggregateUnit: string;

  @ApiProperty()
  @Column({ default: false })
  public lazyLoad: boolean;

  @Column('json', {
    default: {},
  })
  public description: JSON;
}
