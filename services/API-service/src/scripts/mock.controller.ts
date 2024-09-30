import {
  Body,
  Controller,
  HttpStatus,
  ParseBoolPipe,
  Post,
  Query,
  Res,
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

import { DisasterType } from '../api/disaster/disaster-type.enum';
import { UserRole } from '../api/user/user-role.enum';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import {
  EpidemicsScenario,
  FlashFloodsScenario,
  FloodsScenario,
} from './enum/mock-scenario.enum';
import { MockService } from './mock.service';

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
      'trigger: ongoing + trigger + warning event; warning: 1 warning event; warning-to-trigger: 1 event that evolves from warning to trigger',
  })
  @IsEnum(FloodsScenario)
  public readonly scenario: FloodsScenario;
}

export class MockFlashFloodsScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(FlashFloodsScenario).join(' | '),
    description: 'trigger: trigger + warning event',
  })
  @IsEnum(FlashFloodsScenario)
  public readonly scenario: FlashFloodsScenario;
}

export class MockEpidemicsScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(EpidemicsScenario).join(' | '),
    description: 'trigger: trigger in each month',
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
    @Query(
      'isApiTest',
      new ParseBoolPipe({
        optional: true,
      }),
    )
    isApiTest: boolean,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    const result = await this.mockService.mock(
      body,
      DisasterType.Floods,
      false,
      isApiTest,
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
    @Query(
      'isApiTest',
      new ParseBoolPipe({
        optional: true,
      }),
    )
    isApiTest: boolean,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }
    const result = await this.mockService.mock(
      body,
      DisasterType.FlashFloods,
      false,
      isApiTest,
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
    @Query(
      'isApiTest',
      new ParseBoolPipe({
        optional: true,
      }),
    )
    isApiTest: boolean,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const disasterType =
      body.countryCodeISO3 === 'PHL'
        ? DisasterType.Dengue
        : DisasterType.Malaria;
    const result = await this.mockService.mock(
      body,
      disasterType,
      false,
      isApiTest,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
