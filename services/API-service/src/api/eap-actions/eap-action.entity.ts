import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { AreaOfFocusEntity } from './area-of-focus.entity';
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

    @ManyToOne(
        (): typeof AreaOfFocusEntity => AreaOfFocusEntity,
        (aof): EapActionEntity[] => aof.actions,
    )
    public areaOfFocus: AreaOfFocusEntity;

    @OneToMany(
        (): typeof EapActionStatusEntity => EapActionStatusEntity,
        (i): EapActionEntity => i.actionChecked,
    )
    public checked: EapActionStatusEntity[];
}
