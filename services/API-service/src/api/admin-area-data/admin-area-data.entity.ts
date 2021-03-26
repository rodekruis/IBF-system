import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('adminAreaData')
export class AdminAreaDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

  @Column()
  public adminLevel: number;

  @Column()
  public placeCode: string;

  @Column()
  public key: string;

  @Column({ nullable: true })
  public value: string;
}
