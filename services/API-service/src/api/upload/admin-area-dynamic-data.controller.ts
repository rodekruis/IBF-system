import { Body, Get, Param } from '@nestjs/common';
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';

@ApiBearerAuth()
@ApiTags('admin-area-dynamic-data')
@Controller('admin-area-dynamic-data')
export class AdminAreaDynamicDataController {
  private readonly uploadService: AdminAreaDynamicDataService;
  public constructor(uploadService: AdminAreaDynamicDataService) {
    this.uploadService = uploadService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload exposure data at a regular interval',
  })
  @Post('upload')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(
    @Body() placeCodeExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    await this.uploadService.exposure(placeCodeExposure);
  }

  @ApiOperation({ summary: 'Get dynamic admin-area data' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @Get(':countryCode/:adminLevel/:leadTime?')
  public async getAdminAreaData(@Param() params): Promise<any> {
    // return await this.adminAreaDataService.getAdminAreaDynamicData(
    //   params.countryCode,
    //   params.adminLevel,
    //   params.leadTime,
    // );
  }
}
