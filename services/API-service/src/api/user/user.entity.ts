import crypto from 'crypto';

import { IsEmail } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public userId: string;

  @Column({ unique: true })
  @IsEmail()
  public email: string;

  @Column({ nullable: true })
  public whatsappNumber: string;

  @Column({ unique: true })
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
  @JoinTable({
    name: 'user_countries',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'email',
    },
    inverseJoinColumn: {
      name: 'country',
      referencedColumnName: 'countryCodeISO3',
    },
  })
  public countries: CountryEntity[];

  @ManyToMany(
    (): typeof DisasterTypeEntity => DisasterTypeEntity,
    (disasterType): UserEntity[] => disasterType.users,
  )
  @JoinTable({
    name: 'user_disaster_types',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'email',
    },
    inverseJoinColumn: {
      name: 'disasterType',
      referencedColumnName: 'disasterType',
    },
  })
  public disasterTypes: DisasterTypeEntity[];

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

  @OneToMany(
    (): typeof EventPlaceCodeEntity => EventPlaceCodeEntity,
    (placeCode): UserEntity => placeCode.user,
  )
  public stoppedTriggers: EventPlaceCodeEntity[];
}
