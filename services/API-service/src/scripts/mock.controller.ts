import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RolesGuard } from '../roles.guard';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { Roles } from '../roles.decorator';
import { UserRole } from '../api/user/user-role.enum';
import { MockService } from './mock.service';
import {
  FloodsScenario,
  FlashFloodsScenario,
  EpidemicsScenario,
} from './enum/mock-scenario.enum';

export class MockBaseScenario {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty({
    example: Object.values([
      'UGA',
      'KEN',
      'ETH',
      'ZMB',
      'MWI',
      'ZWE',
      'EGY',
      'PHL',
      'SSD',
    ]).join(' | '),
  })
  public readonly countryCodeISO3: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  public readonly removeEvents: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public readonly date: Date;
}

export class MockFloodsScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(FloodsScenario).join(' | '),
    description:
      'default: ongoing + trigger + warning event; warnings-only: 2 warning events; warning-to-trigger: 1 event that evolves from warning to trigger',
  })
  @IsEnum(FloodsScenario)
  public readonly scenario: FloodsScenario;
}

export class MockFlashFloodsScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(FlashFloodsScenario).join(' | '),
    description: 'default: trigger + warning event',
  })
  @IsEnum(FlashFloodsScenario)
  public readonly scenario: FlashFloodsScenario;
}

export class MockEpidemicsScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(EpidemicsScenario).join(' | '),
    description: 'default: trigger in each month',
  })
  @IsEnum(EpidemicsScenario)
  public readonly scenario: EpidemicsScenario;
}

@Controller('mock')
@ApiTags('--- mock/seed data ---')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class MockController {
  public constructor(private mockService: MockService) {}

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific floods scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific floods scenario',
  })
  @Post('/floods')
  public async mockFloodsScenario(
    @Body() body: MockFloodsScenario,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    const result = await this.mockService.mock(
      body,
      DisasterType.Floods,
      false,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific floods scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific floods scenario',
  })
  @Post('/flash-floods')
  public async mockFlashFloodsScenario(
    @Body() body: MockFlashFloodsScenario,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    const result = await this.mockService.mock(
      body,
      DisasterType.FlashFloods,
      false,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific epidemics scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific epidemics scenario',
  })
  @Post('/epidemics')
  public async mockEpidemicsScenario(
    @Body() body: MockEpidemicsScenario,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const disasterType =
      body.countryCodeISO3 === 'PHL'
        ? DisasterType.Dengue
        : DisasterType.Malaria;
    const result = await this.mockService.mock(body, disasterType, false);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
