import { Get, Param, Controller, UseGuards } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { GeoJson } from '../../shared/geo.model';
import { WaterpointsService } from './waterpoints.service';
import { RolesGuard } from '../../roles.guard';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('waterpoints')
@Controller('waterpoints')
export class WaterpointsController {
  private readonly waterpointsService: WaterpointsService;

  public constructor(waterpointsService: WaterpointsService) {
    this.waterpointsService = waterpointsService;
  }

  @ApiOperation({
    summary: 'Get waterpoint locations and attributes for country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Waterpoint locations and attributes in GEOJSON format',
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
  })
  @Get(':countryCodeISO3')
  public async getWaterpoints(
    @Param() params,
  ): Promise<AxiosResponse<GeoJson>> {
    const result = await this.waterpointsService.getWaterpoints(
      params.countryCodeISO3,
    );
    return result;
  }
}
