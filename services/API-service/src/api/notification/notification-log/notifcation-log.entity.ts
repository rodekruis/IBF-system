import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { NotificationChannel } from './enum/notification-channel.enum';

@Entity('notification-log')
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  public notificationLogId: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  public channel: NotificationChannel;

  @Column()
  public recipientCount: number;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public disasterType: DisasterType;

  @Column('character varying', { array: true })
  public eventNames: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
