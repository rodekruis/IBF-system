import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { UserEntity } from '../user/user.entity';
import { EapActionEntity } from './eap-action.entity';

@Entity('eap-action-status')
export class EapActionStatusEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @ManyToOne(
    (): typeof EapActionEntity => EapActionEntity,
    (eapActionStatus): EapActionStatusEntity[] => eapActionStatus.checked,
  )
  public actionChecked: EapActionEntity;

  @ApiProperty({ example: true })
  @Column()
  public status: boolean;

  @ApiProperty()
  @ManyToOne(
    (): typeof EventPlaceCodeEntity => EventPlaceCodeEntity,
    (eventPlaceCode): EapActionStatusEntity[] =>
      eventPlaceCode.eapActionStatuses,
  )
  public eventPlaceCode: EventPlaceCodeEntity;

  @ApiProperty({ example: '21UGA001001' })
  @Index()
  @Column()
  public placeCode: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public timestamp: Date;

  @ManyToOne(
    (): typeof UserEntity => UserEntity,
    (user): EapActionStatusEntity[] => user.actions,
  )
  public user: UserEntity;
}
