import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('adminArea')
export class AdminAreaEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public country_code: string;

  @Column()
  public admin_level: number;

  @Column()
  pcode: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  pcode_parent: string;

  @Column({ nullable: true })
  geom: string;

  @Column({ nullable: true })
  glofas_station: string;
}
