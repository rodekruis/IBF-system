import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('glofasStation')
export class GlofasStationEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne((): typeof CountryEntity => CountryEntity)
    @JoinColumn({
        name: 'countryCodeISO3',
        referencedColumnName: 'countryCodeISO3',
    })
    public countryCodeISO3: string;

    @Column({ unique: true })
    public stationCode: string;

    @Column({ nullable: true })
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

    @Column({ nullable: true, type: 'real' })
    public lat: string;

    @Column({ nullable: true, type: 'real' })
    public lon: string;

    @Column({ nullable: true })
    public geom: string;
}
