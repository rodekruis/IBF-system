import { UserEntity } from '../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('country')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column()
  public countryCode: string;

  @Column()
  public countryName: string;

  @Column()
  public status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @ManyToMany(type => UserEntity, user => user.countries)
  public users: UserEntity[];
}
