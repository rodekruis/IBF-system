import { ApiProperty } from '@nestjs/swagger';

import { IsIn } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('layer-metadata')
export class LayerMetadataEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('json', {
    default: {},
  })
  public countryDisasterTypes: JSON;

  @ApiProperty()
  @Column()
  public name: string;

  @ApiProperty()
  @Column()
  public label: string;

  @ApiProperty({ example: 'wms' })
  @Column()
  @IsIn(['wms', 'poi', 'shape'])
  public type: string;

  @ApiProperty()
  @Column('json', { nullable: true, default: null })
  public legendColor: JSON;

  @ApiProperty({ example: false })
  @Column({ nullable: true })
  public leadTimeDependent: boolean;

  @ApiProperty({ example: 'no' })
  @Column()
  @IsIn(['no', 'yes', 'if-trigger'])
  public active: string;

  @Column('json', {
    default: {},
  })
  public description: JSON;
}
