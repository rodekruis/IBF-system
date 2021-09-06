import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { DamSiteService } from './dam-site.service';
import { GeoJson } from '../../shared/geo.model';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('dam-sites')
@Controller('dam-sites')
export class DamSiteController {
  private readonly damSiteService: DamSiteService;

  public constructor(damSiteService: DamSiteService) {
    this.damSiteService = damSiteService;
  }

  @ApiOperation({ summary: 'Get DamSite by country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get(':countryCodeISO3')
  public async getDamSites(@Param() params): Promise<GeoJson> {
    return await this.damSiteService.getDamSitesByCountry(
      params.countryCodeISO3,
    );
  }
}
