import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('redcrossBranch')
export class RedcrossBranchEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

  @Column()
  public name: string;

  @Column({ nullable: true })
  public nrVolunteers: string;

  @Column({ nullable: true })
  public contactPerson: string;

  @Column({ nullable: true })
  public contactAddress: string;

  @Column({ nullable: true })
  public contactNumber: string;

  @Column()
  public geom: string;
}
