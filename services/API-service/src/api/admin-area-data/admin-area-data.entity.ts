import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('adminAreaData')
export class AdminAreaDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public adminAreaDataId: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'countryCodeISO3' })
  public countryCode: string;

  @Column()
  public adminLevel: number;

  @Column()
  public placeCode: string;

  @Column()
  public key: string;

  @Column({ nullable: true, type: 'real' })
  public value: number;
}
