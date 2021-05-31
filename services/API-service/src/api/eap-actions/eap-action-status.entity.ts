import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { UserEntity } from '../user/user.entity';
import { EapActionEntity } from './eap-action.entity';

@Entity('eap-action-status')
export class EapActionStatusEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(
    (): typeof EapActionEntity => EapActionEntity,
    (eapActionStatus): EapActionStatusEntity[] => eapActionStatus.checked,
  )
  public actionChecked: EapActionEntity;

  @Column()
  public status: boolean;

  @ManyToOne(
    (): typeof EventPlaceCodeEntity => EventPlaceCodeEntity,
    (eventPlaceCode): EapActionStatusEntity[] =>
      eventPlaceCode.eapActionStatuses,
  )
  @JoinTable()
  public eventPlaceCode: EventPlaceCodeEntity;

  @Column()
  public placeCode: string;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public timestamp: Date;

  @ManyToOne(
    (): typeof UserEntity => UserEntity,
    (user): EapActionStatusEntity[] => user.actions,
  )
  public user: UserEntity;
}
