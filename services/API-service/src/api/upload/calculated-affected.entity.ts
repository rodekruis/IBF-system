import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('calculated_affected', { schema: 'IBF-pipeline-output' })
export class CalculatedAffectedEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public source: string;

    @Column()
    public sum: string;

    @Column()
    public district: string;

    @Column({ type: 'date' })
    public date: Date;

    @Column({ name: 'country_code' })
    public countryCode: string;

    @Column({ name: 'lead_time' })
    public leadTime: string;
}
