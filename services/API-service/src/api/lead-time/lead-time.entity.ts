import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CountryDisasterSettingsEntity } from '../country/country-disaster.entity';

@Entity('lead-time')
export class LeadTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public leadTimeId: string;

  @Column({ unique: true })
  public leadTimeName: string;

  @ManyToMany(
    (): typeof CountryDisasterSettingsEntity => CountryDisasterSettingsEntity,
    (country): LeadTimeEntity[] => country.activeLeadTimes,
  )
  public countries: CountryDisasterSettingsEntity[];

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;
}
