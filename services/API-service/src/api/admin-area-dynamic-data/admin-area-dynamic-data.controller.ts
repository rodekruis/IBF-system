import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { DynamicIndicator } from './enum/dynamic-data-unit';
import { Body, Get, Param, UploadedFile } from '@nestjs/common';
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiBearerAuth()
@ApiTags('admin-area-dynamic-data')
@Controller('admin-area-dynamic-data')
export class AdminAreaDynamicDataController {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  public constructor(adminAreaDynamicDataService: AdminAreaDynamicDataService) {
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload exposure data at a regular interval',
  })
  @Post('exposure')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(
    @Body() placeCodeExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    await this.adminAreaDynamicDataService.exposure(placeCodeExposure);
  }

  @ApiOperation({ summary: 'Get dynamic admin-area data' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @Get(':countryCodeISO3/:adminLevel/:leadTime/:indicator/:disasterType')
  public async getAdminAreaData(
    @Param() params,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDynamicDataService.getAdminAreaDynamicData(
      params.countryCodeISO3,
      params.adminLevel,
      params.leadTime,
      params.indicator as DynamicIndicator,
      params.disasterType as DisasterType,
    );
  }

  @ApiOperation({ summary: 'Get admin-area data per placeCode' })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @ApiParam({ name: 'placeCode', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('get/one/:indicator/:placeCode/:leadTime')
  public async getAdminAreaDataPerPcode(@Param() params): Promise<number> {
    return await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
      params.indicator as DynamicIndicator,
      params.placeCode,
      params.leadTime,
    );
  }

  @ApiOperation({
    summary: 'Post raster file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @Post('raster/:disasterType')
  @UseInterceptors(FileInterceptor('rasterFile'))
  public async postRaster(
    @UploadedFile() rasterFileBlob,
    @Param() params,
  ): Promise<void> {
    await this.adminAreaDynamicDataService.postRaster(
      rasterFileBlob,
      params.disasterType,
    );
  }
}
