import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { ForecastStatus } from './forecast-status.enum';

@Entity('forecast')
export class ForecastEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column()
  public forecastName: string;

  @Column()
  public forecastLabel: string;

  @Column()
  public forecastStatus: ForecastStatus;

  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (country): ForecastEntity[] => country.countryForecasts,
  )
  public countries: CountryEntity[];

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;
}
