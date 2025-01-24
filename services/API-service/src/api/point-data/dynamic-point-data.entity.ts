import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { PointDataEntity } from './point-data.entity';

@Entity('dynamic-point-data')
export class DynamicPointDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public dynamicPointDataId: string;

  @ManyToOne(
    (): typeof PointDataEntity => PointDataEntity,
    (point): DynamicPointDataEntity[] => point.dynamicData,
  )
  public point: PointDataEntity;

  @Column({ nullable: true }) // ##TODO: check!
  public leadTime: LeadTime;

  @Column({ type: 'timestamp' })
  @Index()
  public timestamp: Date;

  @Column()
  public key: string;

  @Column({ nullable: true })
  public value: string;
}
