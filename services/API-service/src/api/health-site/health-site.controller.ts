import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
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

    // NOTE: this endpoint is to be used by the IBF-dashboard instead of the current one in data.controller.ts > TO DO
    @ApiOperation({ summary: 'Get HealthSite by country' })
    @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
    @Get(':countryCodeISO3')
    public async getHelathSites(@Param() params): Promise<HealthSiteEntity[]> {
        return await this.healthSiteService.getHealthSitesCountry(
            params.countryCodeISO3,
        );
    }
}
