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
  public timestamp: Date;

  @ApiProperty({ example: LeadTime.hour1 })
  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @ApiProperty({ example: true })
  @Column()
  public exposed: boolean;
}
