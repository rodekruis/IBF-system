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
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Connection } from 'typeorm';
import { SeedInit } from './seed-init';
import { ScriptsService } from './scripts.service';
import { RolesGuard } from '../roles.guard';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { Roles } from '../roles.decorator';
import { UserRole } from '../api/user/user-role.enum';

class ResetDto {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}

export class MockDynamic {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty({ example: 'UGA' })
  @IsIn(process.env.COUNTRIES.split(','))
  public readonly countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsIn([
    DisasterType.Floods,
    DisasterType.Dengue,
    DisasterType.Malaria,
    DisasterType.Drought,
    DisasterType.HeavyRain,
    DisasterType.Typhoon,
  ])
  public readonly disasterType: DisasterType;

  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  public readonly removeEvents: boolean;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public readonly date: Date;
}

export class MockAll {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty()
  @IsNotEmpty()
  public readonly triggered: boolean;
}

export enum TyphoonScenario {
  NoEvent = 'noEvent',
  EventNoLandfall = 'eventNoLandfall',
  EventNoLandfallYet = 'eventNoLandfallYet',
  EventNoTrigger = 'eventNoTrigger',
  EventTrigger = 'eventTrigger',
  EventAfterLandfall = 'eventAfterLandfall',
}

export class MockTyphoonScenario {
  @ApiProperty({ example: 'fill_in_secret' })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;

  @ApiProperty({ example: 'PHL' })
  @IsIn(['PHL'])
  public readonly countryCodeISO3: string;

  @ApiProperty({
    example: Object.values(TyphoonScenario).join(' | '),
  })
  @IsEnum(TyphoonScenario)
  public readonly scenario: TyphoonScenario;

  @ApiProperty({ example: 1 })
  @IsOptional()
  public readonly eventNr: number;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  public readonly removeEvents: boolean;
}

@Controller('scripts')
@ApiTags('--- mock/seed data ---')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ScriptsController {
  private connection: Connection;

  private readonly scriptsService: ScriptsService;

  public constructor(connection: Connection, scriptsService: ScriptsService) {
    this.connection = connection;
    this.scriptsService = scriptsService;
  }

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Reset database with original seed data' })
  @ApiResponse({
    status: 202,
    description: 'Database reset with original seed data.',
  })
  @Post('/reset')
  public async resetDb(@Body() body: ResetDto, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const seed = new SeedInit(this.connection);
    await seed.run();
    return res
      .status(HttpStatus.ACCEPTED)
      .send('Database reset with original seed data.');
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Mock pipeline data for given country and disaster-type',
  })
  @ApiResponse({
    status: 202,
    description:
      'Successfully uploaded mock pipeline data for given country and disaster-type.',
  })
  @Post('/mock-dynamic-data')
  public async mockDynamic(
    @Body() body: MockDynamic,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    await this.scriptsService.mockCountry(body);

    return res
      .status(HttpStatus.ACCEPTED)
      .send('Successfully uploaded mock pipeline data.');
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for all countries and disaster-types at once',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for all countries and disaster-types',
  })
  @Post('/mock-all')
  public async mockAll(@Body() body: MockAll, @Res() res): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const result = await this.scriptsService.mockAll(body);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload mock data for specific typhoon scenario',
  })
  @ApiResponse({
    status: 202,
    description: 'Uploaded mock data for specific typhoon scenario',
  })
  @Post('/mock-typhoon-scenario')
  public async mockTyphoonScenario(
    @Body() body: MockTyphoonScenario,
    @Res() res,
  ): Promise<string> {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const result = await this.scriptsService.mockTyphoonScenario(body);

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
