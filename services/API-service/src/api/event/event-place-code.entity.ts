import {
  Check,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
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

  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @Column({ nullable: true })
  public eventName: string;

  @Column({ default: true })
  public forecastTrigger: boolean;

  @Column({ type: 'timestamp' })
  public firstIssuedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public eventStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public eventTriggerStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public pipelineUpdateTimestamp: Date;

  @Column({ type: 'float8', nullable: true })
  public forecastSeverity: number;

  @Column({ type: 'float8', nullable: true })
  public mainExposureValue: number;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"firstIssuedDate" <= "endDate"`)
  public endDate: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  public userTriggerDate: Date;

  @Column({ default: false })
  public userTrigger: boolean;

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
    (user): EventPlaceCodeEntity[] => user.userTriggers,
  )
  public user: UserEntity;
}
