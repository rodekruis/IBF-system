import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LeadTime } from './enum/lead-time.enum';

@Entity('trigger_per_lead_time')
export class TriggerPerLeadTime {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'date' })
  public date: Date;

  @Column()
  public countryCode: string;

  @Column()
  public leadTime: LeadTime;

  @Column({ default: false })
  public triggered: boolean;
}
