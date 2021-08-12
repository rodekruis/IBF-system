import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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

  @ApiOperation({ summary: 'Get indicator metadata' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @Get('indicators/:countryCodeISO3/:disasterType')
  public async getIndicators(
    @Param() params,
  ): Promise<IndicatorMetadataEntity[]> {
    return await this.metadataService.getIndicatorsByCountry(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @ApiOperation({ summary: 'Get layer metadata' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @Get('layers/:countryCodeISO3/:disasterType')
  public async getLayers(@Param() params): Promise<LayerMetadataEntity[]> {
    return await this.metadataService.getLayersByCountry(
      params.countryCodeISO3,
      params.disasterType,
    );
  }
}
