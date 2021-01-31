import { Get, Param, Controller, UseGuards } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  ApiUseTags,
  ApiOperation,
  ApiImplicitParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GeoJson } from '../data/geo.model';
import { WaterpointsService } from './waterpoints.service';
import { RolesGuard } from '../../roles.guard';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiUseTags('waterpoints')
@Controller('waterpoints')
export class WaterpointsController {
  private readonly waterpointsService: WaterpointsService;

  public constructor(waterpointsService: WaterpointsService) {
    this.waterpointsService = waterpointsService;
  }

  @ApiOperation({ title: 'Get waterpoint data' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get(':countryCode')
  public async getWaterpoints(
    @Param() params,
  ): Promise<AxiosResponse<GeoJson>> {
    return await this.waterpointsService.getWaterpoints(params.countryCode);
  }
}
