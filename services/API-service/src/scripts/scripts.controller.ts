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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Response } from 'express';

import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { UserRole } from '../api/user/user-role.enum';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import { MockDto } from './dto/mock.dto';
import { defaultSeed, SeedDto } from './dto/seed.dto';
import { MockService } from './mock.service';
import { SeedInit } from './seed-init';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('--app--')
@Controller()
export class ScriptsController {
  public constructor(
    private seedInit: SeedInit,
    private mockService: MockService,
  ) {}

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Seed database' })
  @ApiQuery({
    name: 'reset',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'Truncate database tables before inserting seed data. Request body is ignored if reset is true. WARNING: Data loss cannot be undone.',
  })
  @ApiResponse({ status: 202, description: 'Seed database' })
  @Post('/seed')
  public async seed(
    @Body() seed: SeedDto = defaultSeed,
    @Query('reset', new ParseBoolPipe({ optional: true })) reset = false,
    @Res() res: Response,
  ) {
    if (reset) {
      // NOTE: if reset truncates all tables so we must seed all tables
      seed = defaultSeed;
    }

    await this.seedInit.seed({ reset, seed });

    return res
      .status(HttpStatus.ACCEPTED)
      .send('Seed data inserted into the database');
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Upload mock data for specified country and/or disasterType, or all if not specified',
  })
  @ApiResponse({
    status: 202,
    description:
      'Uploaded mock data for specified country, disasterType and scenario, if matching mock data found',
  })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @ApiQuery({ name: 'countryCodeISO3', required: false })
  @ApiQuery({
    name: 'noNotifications',
    required: false,
    schema: { default: true, type: 'boolean' },
    type: 'boolean',
    description: 'Set to false to send actual test notifications',
  })
  @Post('mock')
  public async mock(
    @Query('disasterType') disasterType: DisasterType,
    @Query('countryCodeISO3') countryCodeISO3: string,
    @Body() body: MockDto,
    @Res() res: Response,
    @Query('noNotifications', new ParseBoolPipe({ optional: true }))
    noNotifications: boolean,
  ) {
    const result = await this.mockService.mock(
      body,
      disasterType,
      countryCodeISO3,
      noNotifications,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
