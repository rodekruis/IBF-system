import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('rainfallTriggers')
export class RainfallTriggersEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne((): typeof CountryEntity => CountryEntity)
    @JoinColumn({
        name: 'countryCodeISO3',
        referencedColumnName: 'countryCodeISO3',
    })
    public countryCodeISO3: string;

    @Column({ type: 'real' })
    public lat: string;

    @Column({ type: 'real' })
    public lon: string;

    @Column()
    public leadTime: string;

    @Column({ type: 'real' })
    public triggerLevel: string;

    @Column({ nullable: true, type: 'real' })
    public threshold99Perc: string;

    @Column({ nullable: true, type: 'real' })
    public threshold2Year: string;

    @Column({ nullable: true, type: 'real' })
    public threshold5Year: string;

    @Column({ nullable: true, type: 'real' })
    public threshold10Year: string;

    @Column({ nullable: true, type: 'real' })
    public threshold20Year: string;

    @Column({ nullable: true, type: 'real' })
    public threshold50Year: string;

    @Column({ nullable: true, type: 'real' })
    public threshold100Year: string;
}
