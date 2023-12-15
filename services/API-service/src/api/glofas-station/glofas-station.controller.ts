import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
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
