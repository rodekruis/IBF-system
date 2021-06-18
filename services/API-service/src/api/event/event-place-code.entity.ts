import {
  Entity,
  Column,
  Check,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';

@Entity('event-place-code')
export class EventPlaceCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  public eventPlaceCodeId: string;

  @Column({})
  public placeCode: string;

  @Column({ type: 'timestamp' })
  public startDate: Date;

  @Column({ type: 'float8', nullable: true })
  public actionsValue: number;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"startDate" <= "endDate"`)
  public endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public manualClosedDate: Date;

  @Column({ default: true })
  public activeTrigger: boolean;

  @Column({ default: false })
  public closed: boolean;

  @OneToMany(
    (): typeof EapActionStatusEntity => EapActionStatusEntity,
    (eapActionStatus): EventPlaceCodeEntity => eapActionStatus.eventPlaceCode,
    { onDelete: 'CASCADE' },
  )
  @JoinTable()
  public eapActionStatuses: EapActionStatusEntity[];
}
