import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('adminArea')
export class AdminAreaEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne((): typeof CountryEntity => CountryEntity)
    @JoinColumn({
        name: 'countryCode',
        referencedColumnName: 'countryCodeISO3',
    })
    public countryCode: string;

    @Column()
    public adminLevel: number;

    @Column()
    public placeCode: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ nullable: true })
    public placeCodeParent: string;

    @Column({ nullable: true })
    public geom: string;

    @Column({ nullable: true })
    public glofasStation: string;
}
