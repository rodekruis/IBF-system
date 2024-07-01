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
import { AddIndicatorsDto } from './dto/add-indicators.dto';
import { AddLayersDto } from './dto/add-layers.dto';
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

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) indicators' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated indicators.',
    type: [IndicatorMetadataEntity],
  })
  @Post('indicators')
  public async addOrUpdateIndicators(
    @Body() indicators: AddIndicatorsDto,
  ): Promise<IndicatorMetadataEntity[]> {
    return await this.metadataService.addOrUpdateIndicators(indicators);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) layers' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated layers.',
    type: [LayerMetadataEntity],
  })
  @Post('layers')
  public async addOrUpdateLayers(
    @Body() layers: AddLayersDto,
  ): Promise<LayerMetadataEntity[]> {
    return await this.metadataService.addOrUpdateLayers(layers);
  }

  @ApiOperation({
    summary:
      'Get metadata on all indicators (admin-area-layers) for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Rainfall trigger levels per coordinate and lead-time for given country.',
    type: [IndicatorMetadataEntity],
  })
  @Get('indicators/:countryCodeISO3/:disasterType')
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
