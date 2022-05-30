import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AreaOfFocusEntity } from '../area-of-focus.entity';

class EapActionDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: 'floods' })
  @IsNotEmpty()
  @IsString()
  public disasterType: string;

  @ApiProperty({ example: JSON.parse(JSON.stringify({ id: 'drr' })) })
  @IsNotEmpty()
  public areaOfFocus: AreaOfFocusEntity;

  @ApiProperty({ example: 'drr-1' })
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty({ example: 'DRR dummy action' })
  @IsNotEmpty()
  @IsString()
  public label: string;

  @ApiProperty({ example: null })
  public month: JSON;
}

export class AddEapActionsDto {
  @ApiProperty({
    example: [
      {
        countryCodeISO3: 'UGA',
        disasterType: 'floods',
        action: 'drr-1',
        areaOfFocus: { id: 'drr' },
        label: 'DRR dummy action',
        month: null,
      },
    ],
  })
  @IsNotEmpty()
  public eapActions: EapActionDto[];
}
