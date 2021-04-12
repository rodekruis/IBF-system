import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rainfallTriggers')
export class RainfallTriggersEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

  @Column({ type: 'real' })
  public lat: string;

  @Column({ type: 'real' })
  public lon: string;

  @Column()
  public leadTime: string;

  @Column({ nullable: true, type: 'real' })
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
