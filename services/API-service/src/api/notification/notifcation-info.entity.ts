import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_info')
export class NotificationInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  public notificationInfoId: string;

  @Column()
  public logo: string;

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

  @Column({ default: false })
  public useWhatsapp: boolean;

  @Column({ nullable: true })
  public whatsappMessage: string;
}
