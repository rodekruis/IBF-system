import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('indicator')
export class IndicatorEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  public country_codes: string;
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
  public aggregateIndicator: boolean | null;
  @Column()
  public numberFormatAggregate: string;
  @Column({ default: 1 })
  public order: number;
  @Column({ nullable: true })
  public unit: string;
  @Column()
  public source: string;
  @Column()
  public description: string;
  @Column({ default: false })
  public lazyLoad: boolean;
}
