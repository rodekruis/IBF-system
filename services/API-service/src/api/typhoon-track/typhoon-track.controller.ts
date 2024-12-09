import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { UserRole } from '../user/user-role.enum';
import { UploadTyphoonTrackDto } from './dto/upload-typhoon-track';
import { TyphoonTrackEntity } from './typhoon-track.entity';
import { TyphoonTrackService } from './typhoon-track.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('typhoon-track')
@Controller('typhoon-track')
export class TyphoonTrackController {
  private readonly typhoonTrackService: TyphoonTrackService;

  public constructor(typhoonTrackService: TyphoonTrackService) {
    this.typhoonTrackService = typhoonTrackService;
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary: 'Upload typhoon track data (used by IBF Typhoon pipeline)',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded typhoon track data',
    type: [TyphoonTrackEntity],
  })
  @Post()
  public async uploadTyphoonTrack(
    @Body() uploadTyphoonTrack: UploadTyphoonTrackDto,
  ): Promise<void> {
    return await this.typhoonTrackService.uploadTyphoonTrack(
      uploadTyphoonTrack,
    );
  }

  @ApiOperation({
    summary: 'Get Typhoon track data for given country and leadtime',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiQuery({ name: 'eventName', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Typhoon track data for given country and leadtime in GEOJSON format.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3')
  public async getTyphoonTrack(
    @Param() params,
    @Query() query,
  ): Promise<GeoJson> {
    return await this.typhoonTrackService.getTyphoonTrack(
      params.countryCodeISO3,
      query.eventName,
    );
  }
}
