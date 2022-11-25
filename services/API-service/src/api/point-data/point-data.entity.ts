import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum PointDataEnum {
  evacuationCenters = 'evacuation_centers',
  dams = 'dams',
  healthSites = 'health_sites',
  redCrossBranches = 'red_cross_branches',
}

@Entity('point-data')
export class PointDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public pointDataId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public pointDataCategory: PointDataEnum;

  @Column('json', { default: {} })
  public attributes: JSON;

  @Column('json', { nullable: true })
  public geom: JSON;
}
