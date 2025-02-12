import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DynamicPointDataEntity } from './dynamic-point-data.entity';
import { PointDataEnum } from './point-data.enum';

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

  @Column({ default: true })
  public active: boolean;

  @OneToMany(
    (): typeof DynamicPointDataEntity => DynamicPointDataEntity,
    (dynamicData): PointDataEntity => dynamicData.point,
  )
  public dynamicData: DynamicPointDataEntity[];
}
