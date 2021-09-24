import { ApiProperty } from '@nestjs/swagger';

export class AdminDataReturnDto {
  @ApiProperty({ example: '21UGA001001' })
  public placeCode: string;

  @ApiProperty({ example: 10 })
  public value: number;
}
