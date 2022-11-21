import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evacuation-center')
export class EvacuationCenterEntity {
  @PrimaryGeneratedColumn('uuid')
  public evacuationCenterId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public evacuationCenterName: string;

  @Column('json', { nullable: true })
  public geom: JSON;
}
