import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('adminArea')
export class AdminAreaEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

  @Column()
  public adminLevel: number;

  @Column()
  public pcode: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public pcodeParent: string;

  @Column({ nullable: true })
  public geom: string;

  @Column({ nullable: true })
  public glofasStation: string;
}
