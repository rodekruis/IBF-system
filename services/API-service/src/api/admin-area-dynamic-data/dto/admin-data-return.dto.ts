import { ApiProperty } from '@nestjs/swagger';

export class AdminDataReturnDto {
  @ApiProperty({ example: 'UG3066' })
  public placeCode: string;

  @ApiProperty({ example: 10 })
  public value: number;
}
