import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { GlofasStationEntity } from './glofas-station.entity';

@Entity('glofas-station-forecast')
export class GlofasStationForecastEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: LeadTime.day7 })
  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @ApiProperty({ example: new Date() })
  @Column({ type: 'date' })
  public date: Date;

  @ManyToOne(
    (): typeof GlofasStationEntity => GlofasStationEntity,
    (station): GlofasStationForecastEntity[] => station.stationForecasts,
  )
  public glofasStation: GlofasStationEntity;

  @ApiProperty({ example: 100 })
  @Column({ type: 'double precision' })
  public forecastLevel: string;

  @ApiProperty({ example: 1 })
  @Column({ type: 'double precision' })
  public forecastProbability: string;

  @ApiProperty({ example: 1 })
  @Column()
  @IsIn([0, 1])
  public forecastTrigger: number;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true })
  public forecastReturnPeriod: number;

  @ApiProperty({ example: 100 })
  @Column()
  public triggerLevel: number;
}
