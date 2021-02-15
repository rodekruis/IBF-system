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

  @OneToMany(
    (): typeof EapActionEntity => EapActionEntity,
    (areaOfFocus): AreaOfFocusEntity => areaOfFocus.areaOfFocus,
  )
  public actions: EapActionEntity[];
}
