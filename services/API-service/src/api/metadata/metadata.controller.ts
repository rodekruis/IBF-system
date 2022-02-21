import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { MetadataService } from './metadata.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('metadata')
@Controller('metadata')
export class MetadataController {
  private readonly metadataService: MetadataService;

  public constructor(metadataService: MetadataService) {
    this.metadataService = metadataService;
  }

  @ApiOperation({
    summary:
      'Get metadata on all indicators (admin-area-layers) for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'eventName', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Rainfall trigger levels per coordinate and lead-time for given country.',
    type: [IndicatorMetadataEntity],
  })
  @Get('indicators/:countryCodeISO3/:disasterType/:eventName')
  public async getIndicators(
    @Param() params,
  ): Promise<IndicatorMetadataEntity[]> {
    return await this.metadataService.getIndicatorsByCountryAndDisaster(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @ApiOperation({
    summary: 'Get metadata on all layers for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Rainfall trigger levels per coordinate and lead-time for given country.',
    type: [LayerMetadataEntity],
  })
  @Get('layers/:countryCodeISO3/:disasterType')
  public async getLayers(@Param() params): Promise<LayerMetadataEntity[]> {
    return await this.metadataService.getLayersByCountryAndDisaster(
      params.countryCodeISO3,
      params.disasterType,
    );
  }
}
