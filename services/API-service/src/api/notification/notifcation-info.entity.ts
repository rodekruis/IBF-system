import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_info')
export class NotificationInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  public notificationInfoId: string;

  @Column('json', { default: {} })
  public logo: JSON;

  @Column('json', { default: {} })
  public triggerStatement: JSON;

  @Column({ nullable: true })
  public linkSocialMediaType: string;

  @Column({ nullable: true })
  public linkSocialMediaUrl: string;

  @Column({ nullable: true })
  public linkVideo: string;

  @Column({ nullable: true })
  public linkPdf: string;

  @Column('json', { default: {}, nullable: true })
  public useWhatsapp: JSON;

  @Column('json', { default: {} })
  public whatsappMessage: JSON;

  @Column({ nullable: true })
  public externalEarlyActionForm: string;
}
