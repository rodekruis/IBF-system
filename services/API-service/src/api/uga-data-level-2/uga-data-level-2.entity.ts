import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

@Entity('UGA_Data_level2', { schema: 'IBF-static-input' })
export class UgaDataLevel2Entity {
  @PrimaryColumn()
  public pcode: string;

  @Column({ type: 'float' })
  public covidrisk: number;
}
