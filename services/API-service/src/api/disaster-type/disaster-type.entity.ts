import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  LeadTime,
  LeadTimeUnit,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';
import { UserEntity } from '../user/user.entity';
import { DisasterType } from './disaster-type.enum';

@Entity('disaster')
export class DisasterTypeEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: DisasterType.Floods })
  @Column({ unique: true })
  public disasterType: DisasterType;

  @ApiProperty()
  @Column()
  public label: string;

  @ApiProperty({ example: 'population_affected' })
  @Column({ default: 'population_affected' })
  public triggerUnit: string;

  @ApiProperty({ example: 'population_affected' })
  @Column({ default: 'population_affected' })
  public actionsUnit: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  public showOnlyTriggeredAreas: boolean;

  @ApiProperty({ example: [{ countryCodeISO3: 'UGA' }] })
  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (countries): DisasterTypeEntity[] => countries.disasterTypes,
  )
  @JoinTable()
  public countries: CountryEntity[];

  @ApiProperty({ example: LeadTimeUnit.day })
  @Column({ nullable: true })
  public leadTimeUnit: LeadTimeUnit;

  @ApiProperty({ example: LeadTime.day1 })
  @Column({ nullable: true })
  public minLeadTime: LeadTime;

  @ApiProperty({ example: LeadTime.day7 })
  @Column({ nullable: true })
  public maxLeadTime: LeadTime;

  @ManyToMany(
    (): typeof UserEntity => UserEntity,
    (user): DisasterTypeEntity[] => user.disasterTypes,
  )
  public users: UserEntity[];
}
