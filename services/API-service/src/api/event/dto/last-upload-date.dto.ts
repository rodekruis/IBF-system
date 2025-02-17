import { ApiProperty } from '@nestjs/swagger';

export class LastUploadDateDto {
  @ApiProperty({ example: new Date().toISOString() })
  public date: string;
  @ApiProperty({ example: new Date() })
  public timestamp: Date;
}
