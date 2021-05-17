import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

    @Column('uuid')
    public eventPlaceCodeId: string;

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
