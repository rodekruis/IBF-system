import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationTriggerEntity } from './glofas-station-trigger.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofasStations')
@Controller('glofasStations')
export class GlofasStationController {
    private readonly glofasStationService: GlofasStationService;

    public constructor(glofasStationService: GlofasStationService) {
        this.glofasStationService = glofasStationService;
    }

    @ApiOperation({ summary: 'Get Glofas stations by country' })
    @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
    @Get(':countryCodeISO3')
    public async getStations(@Param() params): Promise<GlofasStationEntity[]> {
        return await this.glofasStationService.getStationsByCountry(
            params.countryCodeISO3,
        );
    }

    @ApiOperation({ summary: 'Upload Glofas forecast data per station' })
    @Post('triggers')
    public async uploadTriggerDataPerStation(
        @Body() uploadTriggerPerStation: UploadTriggerPerStationDto,
    ): Promise<GlofasStationTriggerEntity[]> {
        return await this.glofasStationService.uploadTriggerDataPerStation(
            uploadTriggerPerStation,
        );
    }
}
