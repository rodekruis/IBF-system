import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  MultiPolygon,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';

@Entity('event-area')
export class EventAreaEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'MWI' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.FlashFloods })
  @ManyToOne((): typeof DisasterEntity => DisasterEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @ApiProperty({ example: 'Rumphi' })
  @Column()
  public eventAreaName: string;

  @ApiProperty()
  @Column('geometry', {
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
  })
  public geom: MultiPolygon;
}
