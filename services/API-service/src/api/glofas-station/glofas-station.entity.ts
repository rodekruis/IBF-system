import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';

@Entity('glofas-station')
export class GlofasStationEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column()
  public stationCode: string;

  @OneToMany(
    (): typeof GlofasStationForecastEntity => GlofasStationForecastEntity,
    (station): GlofasStationEntity => station.glofasStation,
  )
  public stationForecasts: GlofasStationForecastEntity[];

  @Column({ nullable: true })
  public stationName: string;

  @Column({ nullable: true, type: 'real' })
  public triggerLevel: string;

  @Column({ nullable: true, type: 'real' })
  public threshold2Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold5Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold10Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold20Year: string;

  @Column({ nullable: true, type: 'double precision' })
  public lat: string;

  @Column({ nullable: true, type: 'double precision' })
  public lon: string;

  @Column('json', { nullable: true })
  public geom: JSON;
}
