import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('rainfallTriggers')
@Controller('rainfallTriggers')
export class RainfallTriggersController {
  private readonly rainfallTriggersService: RainfallTriggersService;

  public constructor(rainfallTriggersService: RainfallTriggersService) {
    this.rainfallTriggersService = rainfallTriggersService;
  }

  @ApiOperation({ summary: 'Get rainfall trigger levels by country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get(':countryCodeISO3')
  public async getTriggerLevels(
    @Param() params,
  ): Promise<RainfallTriggersEntity[]> {
    return await this.rainfallTriggersService.getTriggerLevelsByCountry(
      params.countryCodeISO3,
    );
  }
}
