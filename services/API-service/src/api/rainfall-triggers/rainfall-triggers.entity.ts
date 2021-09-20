import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';

@Entity('rainfall-triggers')
export class RainfallTriggersEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'EGY' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: 90.0 })
  @Column({ type: 'real' })
  public lat: string;

  @ApiProperty({ example: 90.0 })
  @Column({ type: 'real' })
  public lon: string;

  @ApiProperty({ example: LeadTime.day3 })
  @Column()
  public leadTime: string;

  @ApiProperty({ example: 100.0 })
  @Column({ type: 'real' })
  public triggerLevel: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold99Perc: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold2Year: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold5Year: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold10Year: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold20Year: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold50Year: string;

  @ApiProperty({ example: 100.0 })
  @Column({ nullable: true, type: 'real' })
  public threshold100Year: string;
}
