import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { EapActionEntity } from './eap-action.entity';

@Entity('area-of-focus')
export class AreaOfFocusEntity {
  @PrimaryColumn()
  public id: string;

  @Column()
  public label: string;

  @Column()
  public icon: string;

  @OneToMany(type => EapActionEntity, i => i.areaOfFocus)
  public actions: EapActionEntity[];
}
