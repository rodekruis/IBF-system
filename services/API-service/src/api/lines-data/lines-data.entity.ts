import {
  Column,
  Entity,
  Geometry,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum LinesDataEnum {
  roads = 'roads',
  buildings = 'buildings',
}

@Entity('lines-data')
export class LinesDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public linesDataId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public linesDataCategory: LinesDataEnum;

  @Column({ nullable: true })
  public referenceId: number;

  @Column('json', { default: {} })
  public attributes: JSON;

  @Index({ spatial: true })
  @Column('geometry', {
    spatialFeatureType: 'GeometryCollection',
    srid: 4326,
    nullable: true,
  })
  public geom: Geometry;
}
