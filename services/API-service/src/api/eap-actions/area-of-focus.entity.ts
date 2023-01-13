import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { EapActionEntity } from './eap-action.entity';

@Entity('area-of-focus')
export class AreaOfFocusEntity {
  @ApiProperty({ example: 'shelter' })
  @PrimaryColumn()
  public id: string;

  @ApiProperty({ example: 'Shelter' })
  @Column()
  public label: string;

  @ApiProperty({ example: 'Shelter description' })
  @Column({ nullable: true })
  public description: string;

  @ApiProperty({ example: 'Shelter.svg' })
  @Column()
  public icon: string;

  @OneToMany(
    (): typeof EapActionEntity => EapActionEntity,
    (areaOfFocus): AreaOfFocusEntity => areaOfFocus.areaOfFocus,
  )
  public actions: EapActionEntity[];
}
