import {
  Entity,
  Column,
  Check,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { UserEntity } from '../user/user.entity';

@Entity('event-place-code')
export class EventPlaceCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  public eventPlaceCodeId: string;

  @ManyToOne(
    (): typeof AdminAreaEntity => AdminAreaEntity,
    (adminArea): EventPlaceCodeEntity[] => adminArea.eventPlaceCodes,
  )
  public adminArea: AdminAreaEntity;

  @ManyToOne((): typeof DisasterEntity => DisasterEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @Column({ nullable: true })
  public eventName: string;

  @Column({ default: true })
  public thresholdReached: boolean;

  // TODO refactor this to be named issuedDate
  // As far as I understand, this is the date when the event was created and not when the disaster will happen
  @Column({ type: 'timestamp' })
  public startDate: Date;

  @Column({ type: 'float8', nullable: true })
  public triggerValue: number;

  @Column({ type: 'float8', nullable: true })
  public actionsValue: number;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"startDate" <= "endDate"`)
  public endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public manualStoppedDate: Date;

  @Column({ default: false })
  public stopped: boolean;

  @Column({ default: false })
  public closed: boolean;

  @OneToMany(
    (): typeof EapActionStatusEntity => EapActionStatusEntity,
    (eapActionStatus): EventPlaceCodeEntity => eapActionStatus.eventPlaceCode,
    { onDelete: 'CASCADE' },
  )
  @JoinTable()
  public eapActionStatuses: EapActionStatusEntity[];

  @ManyToOne(
    (): typeof UserEntity => UserEntity,
    (user): EventPlaceCodeEntity[] => user.stoppedTriggers,
  )
  public user: UserEntity;
}
