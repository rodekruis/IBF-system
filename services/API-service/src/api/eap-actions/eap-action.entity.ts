import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';

@Entity('eap-action')
export class EapActionEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public action: string;

  @Column()
  public label: string;

  @Column('json', { default: {} })
  public month: JSON;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
  @JoinColumn({ name: 'disasterType', referencedColumnName: 'disasterType' })
  public disasterType: string;

  @Column({ nullable: true })
  public areaOfFocusId: string;

  @OneToMany(
    (): typeof EapActionStatusEntity => EapActionStatusEntity,
    (i): EapActionEntity => i.actionChecked,
  )
  public checked: EapActionStatusEntity[];
}
