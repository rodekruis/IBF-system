import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StoreDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly data: string;
}
