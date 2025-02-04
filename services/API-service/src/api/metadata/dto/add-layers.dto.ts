import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';

export class LayerDto {
  @ApiProperty({ example: process.env.COUNTRIES })
  @IsString()
  public countryCodes: string;

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

  @ApiProperty({
    example: {
      UGA: {
        type: 'square',
        value: ['#d7301f'],
      },
    },
  })
  public legendColor: JSON;

  @ApiProperty({ example: false })
  @IsBoolean()
  public leadTimeDependent: boolean;

  @ApiProperty({ example: 'no' })
  @IsIn(['no', 'yes', 'if-trigger'])
  public active: string;

  @ApiProperty({
    example: {
      UGA: {
        'heavy-rain': 'description',
      },
    },
  })
  public description: JSON;
}

export class AddLayersDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public layers: LayerDto[];
}
