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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { DisasterType } from '../api/disaster/disaster-type.enum';
import { UserRole } from '../api/user/user-role.enum';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import {
  DroughtSenario,
  FlashFloodsScenario,
  FloodsScenario,
  MalariaScenario,
  TyphoonScenario,
} from './enum/mock-scenario.enum';
import { MockService } from './mock.service';

export class MockBaseScenario {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty({
    example: Object.values(process.env.COUNTRIES.split(',')).join(' | '),
  })
  @IsIn(Object.values(process.env.COUNTRIES.split(',')))
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
    description:
      'trigger: trigger-blantyre + warning-karonga + trigger-ongoing-rumphi; trigger-blantyre: trigger in Blantyre City; warning-karonga: warning in Karonga; trigger-ongoing-rumphi: ongoing trigger in Rumphi',
  })
  @IsEnum(FlashFloodsScenario)
  public readonly scenario: FlashFloodsScenario;
}

export class MockMalariaScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(MalariaScenario).join(' | '),
    description: 'trigger: trigger in each month',
  })
  @IsEnum(MalariaScenario)
  public readonly scenario: MalariaScenario;
}

export class MockDroughtScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(DroughtSenario).join(' | '),
    description:
      'trigger: trigger for 1st month of each ongoing/upcoming season in each region',
  })
  @IsEnum(DroughtSenario)
  public readonly scenario: DroughtSenario;
}

export class MockAll {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public readonly date: Date;
}

export class MockTyphoonScenario extends MockBaseScenario {
  @ApiProperty({
    example: Object.values(TyphoonScenario).join(' | '),
    description: 'default: ...',
  })
  @IsEnum(TyphoonScenario)
  public readonly scenario: TyphoonScenario;
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
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
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
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
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
    summary: 'Upload mock data for specific malaria scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific malaria scenario',
  })
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
  })
  @Post('/malaria')
  public async mockMalariaScenario(
    @Body() body: MockMalariaScenario,
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
      DisasterType.Malaria,
      false,
      isApiTest,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific drought scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific drought scenario',
  })
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
  })
  @Post('/drought')
  public async mockDroughtScenario(
    @Body() body: MockDroughtScenario,
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
      DisasterType.Drought,
      false,
      isApiTest,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific typhoon scenario',
  })
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific typhoon scenario',
  })
  @Post('/typhoon')
  public async mockTyphoonScenario(
    @Body() body: MockTyphoonScenario,
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
      DisasterType.Typhoon,
      false,
      isApiTest,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for all countries and disaster-types at once',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for all countries and disaster-types',
  })
  @Post('/all')
  public async mockAll(@Body() body: MockAll, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const result = await this.mockService.mockAll(body);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
