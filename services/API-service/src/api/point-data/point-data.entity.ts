import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DynamicPointDataEntity } from './dynamic-point-data.entity';

export enum PointDataCategory {
  evacuationCenters = 'evacuation_centers',
  dams = 'dams',
  healthSites = 'health_sites',
  redCrossBranches = 'red_cross_branches',
  communityNotifications = 'community_notifications',
  schools = 'schools',
  waterpoints = 'waterpoints',
  gauges = 'gauges',
  glofasStations = 'glofas_stations',
}

@Entity('point-data')
export class PointDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public pointDataId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public pointDataCategory: PointDataCategory;

  @Column({ nullable: true })
  public referenceId: string;

  @Column('json', { default: {} })
  public attributes: JSON;

  @Column('json', { nullable: true })
  public geom: JSON;

  @Column({ default: true })
  public active: boolean;

  @OneToMany(
    (): typeof DynamicPointDataEntity => DynamicPointDataEntity,
    (dynamicData): PointDataEntity => dynamicData.point,
  )
  public dynamicData: DynamicPointDataEntity[];
}
