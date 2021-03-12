import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { AdminAreaService } from './admin-area.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('adminAreas')
@Controller('adminAreas')
export class AdminAreaController {
  private readonly adminAreaService: AdminAreaService;

  public constructor(adminAreaService: AdminAreaService) {
    this.adminAreaService = adminAreaService;
  }

  // NOTE: this endpoint is to be used by the IBF-pipeline to read this data from DB (instead of current way > TO DO)
  @ApiOperation({
    summary: 'Get Glofas station to admin-area mapping by country',
  })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get(':countryCode')
  public async getLayers(@Param() params): Promise<any[]> {
    return await this.adminAreaService.getStationAdminAreaMappingByCountry(
      params.countryCode,
    );
  }
}
