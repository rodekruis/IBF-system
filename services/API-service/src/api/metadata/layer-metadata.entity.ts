import { IsIn } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('layer-metadata')
export class LayerMetadataEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;
    @Column()
    public country_codes: string;
    @Column()
    public name: string;
    @Column()
    public label: string;
    @Column()
    @IsIn(['wms', 'poi'])
    public type: string;
    @Column({ nullable: true })
    public legendColor: string;
    @Column({ nullable: true })
    public leadTimeDependent: boolean;
    @Column()
    @IsIn(['no', 'yes', 'if-trigger'])
    public active: string;
}
