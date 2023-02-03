import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisasterType } from '../../disaster/disaster-type.enum';

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

  @ApiProperty({ example: '#be9600' })
  @IsString()
  public legendColor: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  public leadTimeDependent: boolean;

  @ApiProperty({ example: 'no' })
  @IsIn(['no', 'yes', 'if-trigger'])
  public active: string;

  @ApiProperty({
    example: {
      EGY: {
        'heavy-rain':
          'This layer represents the locations of the local branches, the source of this data comes from the National Society and may need updating.<br /><br />Source link: Egyptian Red Crescent Society (ERCS). Year: 2020.',
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
