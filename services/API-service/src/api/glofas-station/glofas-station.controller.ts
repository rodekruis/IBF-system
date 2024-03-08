import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { UserRole } from '../user/user-role.enum';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationService } from './glofas-station.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofas-stations')
@Controller('glofas-stations')
export class GlofasStationController {
  private readonly glofasStationService: GlofasStationService;

  public constructor(glofasStationService: GlofasStationService) {
    this.glofasStationService = glofasStationService;
  }

  // NOTE: This endpoint is old and should be removed after pipeline migrated
  @ApiOperation({
    summary:
      'Get Glofas station locations and attributes for given country (used by IBF-pipeline)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Glofas station locations and attributes for given country.',
  })
  @Get(':countryCodeISO3')
  public async getStationsByCountry(@Param() params): Promise<any[]> {
    return await this.glofasStationService.getStationsByCountry(
      params.countryCodeISO3,
    );
  }

  // NOTE: This endpoint is old and should be removed after pipeline migrated
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload Glofas forecast data per station (used by IBF Floods pipeline)',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded Glofas forecast data per station',
  })
  @Post('triggers')
  public async uploadTriggerDataPerStation(
    @Body() uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<void> {
    await this.glofasStationService.uploadTriggerDataPerStation(
      uploadTriggerPerStation,
    );
  }
}
