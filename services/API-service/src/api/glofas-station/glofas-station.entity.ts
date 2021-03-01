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

  @Column({ nullable: true })
  public geom: string;
}
