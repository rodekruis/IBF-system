import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { CountryEntity } from '../country/country.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';

@Entity('vulnerable-groups')
export class VulnerableGroupsEntity {
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

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestampOfVulnerableGroups: Date;

  @Column({ nullable: true })
  public eventName: string;

  @ApiProperty({ example: new GeoJson() })
  @Column('json', { nullable: true })
  public geom: JSON;
}
