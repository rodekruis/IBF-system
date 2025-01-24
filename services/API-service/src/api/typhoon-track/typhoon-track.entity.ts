import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GeoJson } from '../../shared/geo.model';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';

@Entity('typhoon-track')
export class TyphoonTrackEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'PHL' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column({ nullable: true })
  public leadTime: LeadTime;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestampOfTrackpoint: Date;

  @Column({ nullable: true })
  public windspeed: number;

  @Column({ nullable: true })
  public category: string;

  @Column({ default: false })
  public firstLandfall: boolean;

  @Column({ default: false })
  public closestToLand: boolean;

  @Column({ nullable: true })
  public eventName: string;

  @ApiProperty({ example: new GeoJson() })
  @Column('json', { nullable: true })
  public geom: JSON;
}
