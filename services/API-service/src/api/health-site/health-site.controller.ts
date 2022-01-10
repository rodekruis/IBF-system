import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { UserRole } from '../user/user-role.enum';
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

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) health sites data via CSV',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded health sites data',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('upload/csv/:countryCodeISO3')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() redCrossBranchData,
    @Param() params,
  ): Promise<void> {
    await this.healthSiteService.uploadCsv(
      redCrossBranchData,
      params.countryCodeISO3,
    );
  }
}
