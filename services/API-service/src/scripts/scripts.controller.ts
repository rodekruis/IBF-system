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

import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { UserRole } from '../api/user/user-role.enum';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import { MockInputDto } from './dto/mock-input.dto';
import { ResetDto } from './dto/reset.dto';
import { MockService } from './mock.service';
import { SeedInit } from './seed-init';

@Controller('scripts')
@ApiTags('--- mock/seed data ---')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ScriptsController {
  public constructor(
    private seedInit: SeedInit,
    private mockService: MockService,
  ) {}

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

    await this.seedInit.run();
    return res
      .status(HttpStatus.ACCEPTED)
      .send('Database reset with original seed data.');
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
  @ApiQuery({
    name: 'disasterType',
    required: false,
  })
  @ApiQuery({
    name: 'countryCodeISO3',
    required: false,
  })
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'Set to true for tests',
  })
  @Post('mock')
  public async mock(
    @Query('disasterType') disasterType: DisasterType,
    @Query('countryCodeISO3') countryCodeISO3: string,
    @Body() body: MockInputDto,
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
      disasterType,
      countryCodeISO3,
      isApiTest,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }
}
