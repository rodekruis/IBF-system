import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('health_site')
export class HealthSiteEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public countryCodeISO3: string;

    @Column()
    public name: string;

    @Column()
    public type: string;

    @Column()
    public geom: string;
}
