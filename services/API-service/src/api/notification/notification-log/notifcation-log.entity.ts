import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { NotificationChannel } from './enum/notification-channel.enum';
import { DisasterType } from '../../disaster-type/disaster-type.enum';

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

  @Column()
  public eventNames: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
