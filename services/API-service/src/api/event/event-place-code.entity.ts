import { Entity, Column, Check, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_place_code')
export class EventPlaceCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  public eventPlaceCodeId: string;

  @Column({})
  public placeCode: string;

  @Column({ type: 'timestamp' })
  public startDate: Date;

  @Column({ type: 'float8' })
  public exposureValue: number;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"startDate" <= "endDate"`)
  public endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public manualClosedDate: Date;

  @Column({ default: true })
  public activeTrigger: boolean;

  @Column({ default: false })
  public closed: boolean;
}
