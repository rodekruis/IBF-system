import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('glofasStation')
export class GlofasStationEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

  @Column()
  public stationCode: string;

  @Column()
  public stationName: string;

  @Column({ nullable: true, type: 'real' })
  public triggerLevel: string;

  @Column({ nullable: true, type: 'real' })
  public threshold2Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold5Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold10Year: string;

  @Column({ nullable: true, type: 'real' })
  public threshold20Year: string;

  @Column()
  public geom: string;
}
