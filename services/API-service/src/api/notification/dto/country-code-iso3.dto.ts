import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisasterType } from '../../disaster/disaster-type.enum';

export class SendEmailDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PHL', 'UGA'])
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Dengue })
  @IsNotEmpty()
  @IsString()
  @IsIn([
    DisasterType.Dengue,
    DisasterType.Floods,
    DisasterType.HeavyRain,
    DisasterType.Malaria,
  ])
  public disasterType: DisasterType;
}
