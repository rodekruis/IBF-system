import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'UGA' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: 'G1373' })
  @Column()
  public stationCode: string;

  @ApiProperty({ example: [] })
  @OneToMany(
    (): typeof GlofasStationForecastEntity => GlofasStationForecastEntity,
    (station): GlofasStationEntity => station.glofasStation,
  )
  public stationForecasts: GlofasStationForecastEntity[];

  @ApiProperty()
  @Column({ nullable: true })
  public stationName: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'real' })
  public triggerLevel: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'real' })
  public threshold2Year: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'real' })
  public threshold5Year: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'real' })
  public threshold10Year: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'real' })
  public threshold20Year: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'double precision' })
  public lat: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true, type: 'double precision' })
  public lon: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  public geom: JSON;
}
