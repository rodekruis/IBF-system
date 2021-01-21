import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('indicator')
export class IndicatorEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  public country_code: string;
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
  @Column()
  public numberFormatMap: string;
  @Column()
  public aggregateIndicator: boolean | null;
  @Column()
  public numberFormatAggregate: string;
  @Column()
  public source: string;
  @Column()
  public description: string;
}
