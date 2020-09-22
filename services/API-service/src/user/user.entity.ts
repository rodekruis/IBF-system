import { IsEmail } from 'class-validator';
import { CountryEntity } from '../country/country.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import crypto from 'crypto';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column()
  @IsEmail()
  public email: string;

  @Column()
  public username: string;

  @Column()
  public firstName: string;

  @Column({ nullable: true })
  public middleName: string;

  @Column()
  public lastName: string;

  @Column()
  public role: string;

  @ManyToMany(type => CountryEntity, country => country.users)
  @JoinTable()
  public countries: CountryEntity[];

  @Column()
  public status: string;

  @Column({ select: false })
  public password: string;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @BeforeInsert()
  public hashPassword(): void {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }
}
