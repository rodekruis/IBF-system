import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { DisasterEntity } from '../disaster/disaster.entity';

@Entity('indicator-metadata')
export class IndicatorMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  public country_codes: string;
  @ManyToMany(
    (): typeof DisasterEntity => DisasterEntity,
    (disasterTypes): IndicatorMetadataEntity[] => disasterTypes.indicators,
  )
  public disasterTypes: DisasterEntity[];
  @Column()
  public name: string;
  @Column()
  public label: string;
  @Column()
  public group: string;
  @Column()
  public icon: string;
  @Column()
  public weightedAvg: boolean;
  @Column()
  public active: boolean;
  @Column('json', { nullable: true })
  public colorBreaks: JSON;
  @Column()
  public numberFormatMap: string;
  @Column()
  public aggregateIndicator: string | null;
  @Column()
  public numberFormatAggregate: string;
  @Column({ default: 1 })
  public order: number;
  @Column({ default: false })
  public dynamic: boolean;
  @Column({ nullable: true })
  public unit: string;
  @Column({ default: false })
  public lazyLoad: boolean;
}
