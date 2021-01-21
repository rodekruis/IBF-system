import { IsEmail } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import crypto from 'crypto';

import { CountryEntity } from '../country/country.entity';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public userId: string;

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

  @Column({ default: UserRole.Guest })
  public userRole: UserRole;

  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (country): UserEntity[] => country.users,
  )
  @JoinTable()
  public countries: CountryEntity[];

  @Column({ default: UserStatus.Active })
  public userStatus: UserStatus;

  @Column({ select: false })
  public password: string;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @BeforeInsert()
  public hashPassword(): void {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  @OneToMany(
    (): typeof EapActionStatusEntity => EapActionStatusEntity,
    (action): UserEntity => action.user,
  )
  public actions: EapActionStatusEntity[];
}
