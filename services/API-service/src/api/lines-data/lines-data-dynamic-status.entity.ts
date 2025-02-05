import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { LinesDataEntity } from './lines-data.entity';

@Entity('lines-data-dynamic-status')
export class LinesDataDynamicStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  public linesDataDynamicStatusId: string;

  @ApiProperty({ example: 12345 })
  @ManyToOne(() => LinesDataEntity)
  @JoinColumn({ name: 'referenceId' })
  public linesData: LinesDataEntity;
  @Column()
  public referenceId: number;

  @ApiProperty({ example: new Date() })
  @Column({ type: 'timestamp' })
  @Index()
  public timestamp: Date;

  @ApiProperty({ example: LeadTime.hour1 })
  @Column({ nullable: true })
  @Index()
  public leadTime: LeadTime;

  @ApiProperty({ example: true })
  @Column()
  public exposed: boolean;
}
