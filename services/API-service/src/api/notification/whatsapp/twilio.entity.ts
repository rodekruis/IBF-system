import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  Sms = 'sms',
  Call = 'call',
  Whatsapp = 'whatsapp',
}

@Entity('twilio_message')
export class TwilioMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public accountSid: string;

  @Column()
  public body: string;

  @Column({ nullable: true })
  public mediaUrl: string;

  @Column()
  public to: string;

  @Column()
  public from: string;

  @Column()
  public sid: string;

  @Column()
  public status: string;

  @Column()
  public type: NotificationType;

  @Column({ type: 'timestamp' })
  public dateCreated: Date;
}
