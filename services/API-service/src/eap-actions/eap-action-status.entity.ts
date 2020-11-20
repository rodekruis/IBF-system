/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { EapActionEntity } from './eap-action.entity';

@Entity('eap-action-status')
export class EapActionStatusEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(type => EapActionEntity, i => i.checked)
  public actionChecked: EapActionEntity;

  @Column()
  public status: boolean;

  @Column()
  public event: number;

  @Column()
  public pcode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public timestamp: Date;

  @ManyToOne(type => UserEntity, user => user.actions)
  public user: UserEntity;
}
