import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../user/user.entity';

@Entity('logins')
export class LoginEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  public user: UserEntity;

  @Column()
  public code: number;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;
}
