import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';

@Entity('event-map-image')
export class EventMapImageEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'bytea' })
  public image: Buffer;

  @ApiProperty({ example: 'SSD' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @ManyToOne((): typeof DisasterEntity => DisasterEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  public eventName: string;
}
