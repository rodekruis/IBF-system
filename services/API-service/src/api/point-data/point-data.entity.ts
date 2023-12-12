import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DynamicPointDataEntity } from './dynamic-point-data.entity';

export enum PointDataEnum {
  evacuationCenters = 'evacuation_centers',
  dams = 'dams',
  healthSites = 'health_sites',
  redCrossBranches = 'red_cross_branches',
  communityNotifications = 'community_notifications',
  schools = 'schools',
  waterpointsInternal = 'waterpoints_internal',
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
  public pointDataCategory: PointDataEnum;

  @Column({ nullable: true })
  public referenceId: string;

  @Column('json', { default: {} })
  public attributes: JSON;

  @Column('json', { nullable: true })
  public geom: JSON;

  @OneToMany(
    (): typeof DynamicPointDataEntity => DynamicPointDataEntity,
    (dynamicData): PointDataEntity => dynamicData.point,
  )
  public dynamicData: DynamicPointDataEntity[];
}
