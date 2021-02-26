import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('glofasStation')
export class GlofasStationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country_code: string;

  @Column()
  station_code: string;

  @Column()
  station_name: string;

  @Column({ nullable: true })
  trigger_level: string;

  @Column({ nullable: true })
  geom: string;
}
