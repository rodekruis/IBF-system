import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { FILE_UPLOAD_API_FORMAT } from '../../shared/file-upload-api-format';
import { AdminLevel } from '../country/admin-level.enum';
import { countriesEnum } from '../country/country.enum';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { DynamicIndicator } from './enum/dynamic-data-unit';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-area-dynamic-data')
@Controller('admin-area-dynamic-data')
export class AdminAreaDynamicDataController {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  public constructor(adminAreaDynamicDataService: AdminAreaDynamicDataService) {
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload and process dynamic (exposure) indicator data for given country, disaster-type and lead-time.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Uploaded and processed dynamic (exposure) indicator data for given country, disaster-type and lead-time.',
  })
  @Post('exposure')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(
    @Body() placeCodeExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    await this.adminAreaDynamicDataService.exposure(placeCodeExposure);
  }

  @ApiOperation({
    summary:
      'Get dynamic admin-area data for given indicator, country, disaster-type and lead-time.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'adminLevel', required: true, enum: AdminLevel })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Dynamic admin-area data for given indicator, country, disaster-type and lead-time.',
    type: [AdminDataReturnDto],
  })
  @Get(':countryCodeISO3/:adminLevel/:indicator/:disasterType')
  public async getAdminAreaDynamicData(
    @Param() params,
    @Query() query,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDynamicDataService.getAdminAreaDynamicData(
      params.countryCodeISO3,
      params.adminLevel,
      params.indicator as DynamicIndicator,
      params.disasterType as DisasterType,
      query.leadTime,
      query.eventName,
    );
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload raster file (.tif) such as a disaster-extent for given disaster-type (used by IBF-pipelines)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_API_FORMAT)
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiResponse({
    status: 201,
    description: 'Uploaded raster file for given disaster-type',
  })
  @ApiResponse({
    status: 400,
    description:
      'Provided disaster-type not allowed (or other input mistake leading to Bad Request)',
  })
  @ApiResponse({
    status: 404,
    description: 'Raster file not correctly written',
  })
  @Post('raster/:disasterType')
  @UseInterceptors(FileInterceptor('file'))
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
