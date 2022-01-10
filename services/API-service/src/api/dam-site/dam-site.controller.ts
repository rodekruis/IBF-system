import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { DamSiteService } from './dam-site.service';
import { GeoJson } from '../../shared/geo.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('dam-sites')
@Controller('dam-sites')
export class DamSiteController {
  private readonly damSiteService: DamSiteService;

  public constructor(damSiteService: DamSiteService) {
    this.damSiteService = damSiteService;
  }

  @ApiOperation({
    summary: 'Get dam locations and attributes for given country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Dam locations and attributes for given country.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3')
  public async getDamSites(@Param() params): Promise<GeoJson> {
    return await this.damSiteService.getDamSitesByCountry(
      params.countryCodeISO3,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) dam sites data via CSV',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded dam sites data',
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
    await this.damSiteService.uploadCsv(
      redCrossBranchData,
      params.countryCodeISO3,
    );
  }
}
