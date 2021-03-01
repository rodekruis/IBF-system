import { Entity, Column, Check, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_place_code', { schema: 'IBF-pipeline-output' })
export class EventPlaceCodeEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({})
  public placeCode: string;

  @Column({ type: 'timestamp' })
  public startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"startDate" < "endDate"`)
  public endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  public manualClosedDate: Date;

  @Column({ default: true })
  public activeTrigger: boolean;

  @Column({ default: false })
  public closed: boolean;
}
