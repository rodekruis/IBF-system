import { ApiProperty } from '@nestjs/swagger';

export class AreaOfFocusEnum {
  public static readonly DRR = 'drr';
  public static readonly SHELTER = 'shelter';
  public static readonly LIVELIHOOD = 'livelihood';
  public static readonly HEALTH = 'health';
  public static readonly WASH = 'wash';
  public static readonly INCLUSION = 'inclusion';
  public static readonly MIGRATION = 'migration';
}

export class AreaOfFocusDto {
  @ApiProperty({ example: 'shelter' })
  public id: AreaOfFocusEnum;

  @ApiProperty({ example: 'Shelter' })
  public label: string;

  @ApiProperty({ example: 'Shelter description' })
  public description: string;

  @ApiProperty({ example: 'Shelter.svg' })
  public icon: string;
}
