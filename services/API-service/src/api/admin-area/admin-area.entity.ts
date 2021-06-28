import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';

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

  @Column({ unique: true })
  public placeCode: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public placeCodeParent: string;

  @Column('geometry', { nullable: true })
  public geom: string;

  @Column({ nullable: true })
  public glofasStation: string;

  @OneToMany(
    (): typeof EventPlaceCodeEntity => EventPlaceCodeEntity,
    (eventPlaceCode): AdminAreaEntity => eventPlaceCode.adminArea,
  )
  public eventPlaceCodes: EventPlaceCodeEntity[];
}
