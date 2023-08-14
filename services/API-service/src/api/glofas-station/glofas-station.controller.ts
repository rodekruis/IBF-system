import {
  Body,
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
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';
import { FILE_UPLOAD_API_FORMAT } from '../../shared/file-upload-api-format';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofas-stations')
@Controller('glofas-stations')
export class GlofasStationController {
  private readonly glofasStationService: GlofasStationService;

  public constructor(glofasStationService: GlofasStationService) {
    this.glofasStationService = glofasStationService;
  }

  @ApiOperation({
    summary:
      'Get Glofas station locations and attributes for given country (used by IBF-pipeline)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Glofas station locations and attributes for given country.',
    type: [GlofasStationEntity],
  })
  @Get(':countryCodeISO3')
  public async getStationsByCountry(
    @Param() params,
  ): Promise<GlofasStationEntity[]> {
    return await this.glofasStationService.getStationsByCountry(
      params.countryCodeISO3,
    );
  }

  @ApiOperation({
    summary: 'Get Glofas station forecast data for given country and leadtime',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Glofas station forecast data for given country and leadtime in GEOJSON format.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3/:leadTime')
  public async getStationForecastByLeadTime(@Param() params): Promise<GeoJson> {
    return await this.glofasStationService.getStationForecastByLeadTime(
      params.countryCodeISO3,
      params.leadTime,
    );
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload Glofas forecast data per station (used by IBF Floods pipeline)',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded Glofas forecast data per station',
    type: [GlofasStationForecastEntity],
  })
  @Post('triggers')
  public async uploadTriggerDataPerStation(
    @Body() uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<GlofasStationForecastEntity[]> {
    return await this.glofasStationService.uploadTriggerDataPerStation(
      uploadTriggerPerStation,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Upload (and overwrite) via CSV Glofas station locations and attributes for given country',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded Glofas station locations and attributes',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('upload-csv/:countryCodeISO3')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_API_FORMAT)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() glofasStationData,
    @Param() params,
  ): Promise<void> {
    await this.glofasStationService.uploadCsv(
      glofasStationData,
      params.countryCodeISO3,
    );
  }
}
