import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RolesGuard } from '../../roles.guard';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('rainfall-triggers')
@Controller('rainfall-triggers')
export class RainfallTriggersController {
  private readonly rainfallTriggersService: RainfallTriggersService;

  public constructor(rainfallTriggersService: RainfallTriggersService) {
    this.rainfallTriggersService = rainfallTriggersService;
  }

  @ApiOperation({
    summary:
      'Get rainfall trigger levels for given country. (Used by IBF Heavy Rainfall pipeline.)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Rainfall trigger levels per coordinate and lead-time for given country.',
    type: [RainfallTriggersEntity],
  })
  @Get(':countryCodeISO3')
  public async getTriggerLevels(
    @Param() params,
  ): Promise<RainfallTriggersEntity[]> {
    return await this.rainfallTriggersService.getTriggerLevelsByCountry(
      params.countryCodeISO3,
    );
  }
}
