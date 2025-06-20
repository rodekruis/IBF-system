import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';

@Entity('admin-area')
export class AdminAreaEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'UGA' })
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: 2 })
  @Column()
  public adminLevel: number;

  @ApiProperty({ example: 'UG3066' })
  @Index()
  @Column({ unique: true })
  public placeCode: string;

  @ApiProperty({ example: 'Agago' })
  @Column({ nullable: true })
  public name: string;

  @ApiProperty({ example: 'UG3' })
  @Column({ nullable: true })
  public placeCodeParent: string;

  @ApiProperty()
  @Column('geometry', {
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  public geom: () => string;

  @OneToMany(
    (): typeof EventPlaceCodeEntity => EventPlaceCodeEntity,
    (eventPlaceCode): AdminAreaEntity => eventPlaceCode.adminArea,
    { cascade: true },
  )
  public eventPlaceCodes: EventPlaceCodeEntity[];
}
