import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('health-site')
export class HealthSiteEntity {
  @PrimaryGeneratedColumn('uuid')
  public healthSiteId: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public name: string;

  @Column()
  public type: string;

  @Column()
  public geom: string;
}
