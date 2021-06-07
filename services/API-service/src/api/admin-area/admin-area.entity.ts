import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('admin-area')
export class AdminAreaEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column()
  public adminLevel: number;

  @Column()
  public placeCode: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public placeCodeParent: string;

  @Column('geometry', { nullable: true })
  public geom: string;

  @Column({ nullable: true })
  public glofasStation: string;

  @Column()
  public testColumn: string;
}
