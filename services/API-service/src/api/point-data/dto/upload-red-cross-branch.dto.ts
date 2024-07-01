import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RedCrossBranchDto {
  @ApiProperty({ example: 'branch name' })
  @IsNotEmpty()
  @IsString()
  public branchName: string = undefined;

  @ApiProperty({ example: 3 })
  @IsString()
  @IsOptional()
  public numberOfVolunteers: number = undefined;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactPerson: string = undefined;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactAddress: string = undefined;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactNumber: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
