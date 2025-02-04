import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  DroughtScenario,
  FlashFloodsScenario,
  FloodsScenario,
  MalariaScenario,
  TyphoonScenario,
} from '../enum/mock-scenario.enum';

const combinedScenarios = [
  ...Object.values(TyphoonScenario),
  ...Object.values(DroughtScenario),
  ...Object.values(MalariaScenario),
  ...Object.values(FlashFloodsScenario),
  ...Object.values(FloodsScenario),
];
const deduplicatedScenarios = Array.from(new Set(combinedScenarios)).join(
  ' | ',
);

export class MockInputDto {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  public readonly removeEvents: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public readonly date: Date;

  @ApiProperty({ example: deduplicatedScenarios })
  @IsNotEmpty()
  public readonly scenario:
    | TyphoonScenario
    | DroughtScenario
    | MalariaScenario
    | FlashFloodsScenario
    | FloodsScenario;
}
