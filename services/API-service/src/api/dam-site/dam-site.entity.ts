import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dam-site')
export class DamSiteEntity {
  @PrimaryGeneratedColumn('uuid')
  public damSiteId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public damName: string;

  @Column()
  public fullSupply: string;

  @Column('json', { nullable: true })
  public geom: JSON;

}
