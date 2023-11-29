import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PointDataEntity } from './point-data.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';

@Entity('dynamic-point-data')
export class DynamicPointDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public dynamicPointDataId: string;

  @ManyToOne(
    (): typeof PointDataEntity => PointDataEntity,
    (point): DynamicPointDataEntity[] => point.dynamicData,
  )
  public point: PointDataEntity;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @Column({ type: 'timestamp' })
  public timestamp: Date;

  @Column()
  public key: string;

  @Column({ nullable: true })
  public value: string;
}
