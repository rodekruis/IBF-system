import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { PointDataEntity } from './point-data.entity';

@Entity('point-data-dynamic-status')
export class PointDataDynamicStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  public pointDataDynamicStatusId: string;

  @ApiProperty({ example: 12345 })
  @ManyToOne(() => PointDataEntity)
  @JoinColumn({ name: 'referenceId' })
  public pointData: PointDataEntity;
  @Column()
  public referenceId: number;

  @ApiProperty({ example: new Date() })
  @Column({ type: 'timestamp' })
  public timestamp: Date;

  @ApiProperty({ example: LeadTime.hour1 })
  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @ApiProperty({ example: true })
  @Column()
  public exposed: boolean;
}
