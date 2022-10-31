import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AdminLevel } from '../country/admin-level.enum';
import { CountryEntity } from '../country/country.entity';

@Entity('admin-area-data')
export class AdminAreaDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public adminAreaDataId: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column({
    type: 'enum',
    enum: AdminLevel,
  })
  public adminLevel: AdminLevel;

  @Index()
  @Column()
  public placeCode: string;

  @Column()
  public indicator: string;

  @Column({ nullable: true, type: 'real' })
  public value: number;
}
