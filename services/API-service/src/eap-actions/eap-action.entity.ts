import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EapActionStatusEntity } from './eap-action-status.entity';

@Entity('eap-action')
export class EapActionEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public action: string;

  @Column()
  public label: string;

  @Column({ nullable: true })
  public countryCode: string;

  @Column({ nullable: true })
  public areaOfFocus: string;

  @OneToMany(type => EapActionStatusEntity, i => i.actionChecked)
  public checked: EapActionStatusEntity[];
}
