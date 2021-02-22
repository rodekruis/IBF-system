import { Entity, Column, PrimaryColumn, Check } from 'typeorm';

@Entity('event_pcode', { schema: 'IBF-pipeline-output' })
export class EventPcodeEntity {
  @PrimaryColumn()
  public id: number;

  @Column({ nullable: true })
  public pcode: string;

  @Column({ type: 'timestamp', nullable: true })
  public start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Check(`"start_date" < "end_date"`)
  public end_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  public manual_closed_date: Date;

  @Column({})
  public closed: boolean;
}
