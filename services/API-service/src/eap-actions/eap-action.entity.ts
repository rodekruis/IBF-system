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

  @ManyToOne(type => AreaOfFocusEntity, aof => aof.actions)
  public areaOfFocus: AreaOfFocusEntity;

  @OneToMany(type => EapActionStatusEntity, i => i.actionChecked)
  public checked: EapActionStatusEntity[];
}
