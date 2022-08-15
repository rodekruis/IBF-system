import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisasterType } from '../../disaster/disaster-type.enum';

export class LayerDto {
  @ApiProperty({ example: process.env.COUNTRIES })
  @IsString()
  public country_codes: string;

  @ApiProperty({ example: [{ disasterType: DisasterType.Floods }] })
  @IsEnum(DisasterType)
  public disasterTypes: DisasterType[];

  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public label: string;

  @ApiProperty({ example: 'wms' })
  @IsIn(['wms', 'poi', 'shape'])
  public type: string;

  @ApiProperty({ example: '#be9600' })
  @IsString()
  public legendColor: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  public leadTimeDependent: boolean;

  @ApiProperty({ example: 'no' })
  @IsIn(['no', 'yes', 'if-trigger'])
  public active: string;
}

export class AddLayersDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public layers: LayerDto[];
}
