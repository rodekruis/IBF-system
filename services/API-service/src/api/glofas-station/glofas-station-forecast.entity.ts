import { IsIn } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { GlofasStationEntity } from './glofas-station.entity';

@Entity('glofas-station-forecast')
export class GlofasStationForecastEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @Column({ type: 'date' })
  public date: Date;

  @ManyToOne(
    (): typeof GlofasStationEntity => GlofasStationEntity,
    (station): GlofasStationForecastEntity[] => station.stationForecasts,
  )
  public glofasStation: GlofasStationEntity;

  @Column({ type: 'double precision' })
  public forecastLevel: string;

  @Column({ type: 'double precision' })
  public forecastProbability: string;

  @Column()
  @IsIn([0, 1])
  public forecastTrigger: number;

  @Column({ nullable: true })
  public forecastReturnPeriod: number;
}
