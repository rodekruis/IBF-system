import { Get, Param, Controller } from '@nestjs/common';
import { WaterpointsService } from './waterpoints.service';
import { AxiosResponse } from 'axios';
import {
  ApiUseTags,
  ApiOperation,
  ApiImplicitParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GeoJson } from 'src/models/geo.model';

@ApiBearerAuth()
@ApiUseTags('waterpoints')
@Controller()
export class WaterpointsController {
  private readonly waterpointsService: WaterpointsService;

  public constructor(waterpointsService: WaterpointsService) {
    this.waterpointsService = waterpointsService;
  }

  @ApiOperation({ title: 'Get waterpoint data' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('waterpoints/:countryCode')
  public async getWaterpoints(
    @Param() params,
  ): Promise<AxiosResponse<GeoJson>> {
    return await this.waterpointsService.getWaterpoints(params.countryCode);
  }
}
