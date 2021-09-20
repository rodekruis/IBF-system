import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { HealthSiteEntity } from './health-site.entity';
import { HealthSiteService } from './health-site.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('health-sites')
@Controller('health-sites')
export class HealthSiteController {
  private readonly healthSiteService: HealthSiteService;

  public constructor(healthSiteService: HealthSiteService) {
    this.healthSiteService = healthSiteService;
  }

  @ApiOperation({ summary: 'Get health sites for given country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Health site locations and attributes in GEOJSON format.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3')
  public async getHealthSites(@Param() params): Promise<GeoJson> {
    return await this.healthSiteService.getHealthSitesCountry(
      params.countryCodeISO3,
    );
  }
}
