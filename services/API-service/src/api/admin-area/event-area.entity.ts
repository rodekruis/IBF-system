import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  MultiPolygon,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';

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
  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
  @JoinColumn({ name: 'disasterType', referencedColumnName: 'disasterType' })
  public disasterType: string;

  @ApiProperty({ example: 'Rumphi' })
  @Column()
  public eventAreaName: string;

  @ApiProperty()
  @Column('geometry', { spatialFeatureType: 'MultiPolygon', srid: 4326 })
  public geom: MultiPolygon;
}
