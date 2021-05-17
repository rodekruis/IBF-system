import { Get, Param, Controller, UseGuards } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { GeoJson } from '../data/geo.model';
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

    @ApiOperation({ summary: 'Get waterpoint data' })
    @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
    @Get(':countryCodeISO3')
    public async getWaterpoints(
        @Param() params,
    ): Promise<AxiosResponse<GeoJson>> {
        return await this.waterpointsService.getWaterpoints(
            params.countryCodeISO3,
        );
    }
}
