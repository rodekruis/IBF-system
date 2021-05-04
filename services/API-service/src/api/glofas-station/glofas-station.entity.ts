import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('glofasStation')
export class GlofasStationEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'countryCodeISO3' })
  public countryCode: string;

  @Column()
  public stationCode: string;

  @Column({ nullable: true })
  public stationName: string;

  @Column({ nullable: true, type: 'real' })
  public triggerLevel: string;

  @Column({ nullable: true, type: 'real' })
  public threshold2Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold5Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold10Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold20Year: string;

  @Column({ nullable: true, type: 'real' })
  public lat: string;

  @Column({ nullable: true, type: 'real' })
  public lon: string;

  @Column({ nullable: true })
  public geom: string;
}
