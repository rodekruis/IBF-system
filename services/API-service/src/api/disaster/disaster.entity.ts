import { CountryEntity } from './../country/country.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { DisasterType } from './disaster-type.enum';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { LayerMetadataEntity } from '../metadata/layer-metadata.entity';

@Entity('disaster')
export class DisasterEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public disasterType: DisasterType;

  @Column()
  public label: string;

  @Column({ default: 'population' })
  public triggerUnit: string;

  @Column({ default: 'population_affected' })
  public actionsUnit: string;

  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (countries): DisasterEntity[] => countries.disasterTypes,
  )
  @JoinTable()
  public countries: CountryEntity[];

  @ManyToMany(
    (): typeof LeadTimeEntity => LeadTimeEntity,
    (leadTime): DisasterEntity[] => leadTime.disasterTypes,
  )
  @JoinTable()
  public leadTimes: LeadTimeEntity[];

  @ManyToMany(
    (): typeof IndicatorMetadataEntity => IndicatorMetadataEntity,
    (indicators): DisasterEntity[] => indicators.disasterTypes,
  )
  @JoinTable()
  public indicators: IndicatorMetadataEntity[];

  @ManyToMany(
    (): typeof LayerMetadataEntity => LayerMetadataEntity,
    (layers): DisasterEntity[] => layers.disasterTypes,
  )
  @JoinTable()
  public layers: LayerMetadataEntity[];
}
