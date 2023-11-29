import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { GeoJson } from '../../shared/geo.model';
import { UserRole } from '../user/user-role.enum';
import { PointDataService } from './point-data.service';
import {
  UploadAssetExposureStatusDto,
  UploadDynamicPointDataDto,
} from './dto/upload-asset-exposure-status.dto';
import { FILE_UPLOAD_API_FORMAT } from '../../shared/file-upload-api-format';

@ApiBearerAuth()
@ApiTags('point-data')
@Controller('point-data')
export class PointDataController {
  public constructor(private readonly pointDataService: PointDataService) {}

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get point data locations and attributes for given country and point data layer',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'pointDataCategory', required: true, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved point data locations and attributes for given country and point data layer',
    type: GeoJson,
  })
  @Get(':pointDataCategory/:countryCodeISO3')
  public async getPointData(@Param() params, @Query() query): Promise<GeoJson> {
    return await this.pointDataService.getPointDataByCountry(
      params.pointDataCategory,
      params.countryCodeISO3,
      query.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Upload (and overwrite) via CSV point data locations and attributes for given country and point data layer',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded point data locations and attributes',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @ApiParam({ name: 'pointDataCategory', required: true, type: 'string' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('upload-csv/:pointDataCategory/:countryCodeISO3')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_API_FORMAT)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() pointDataData,
    @Param() params,
  ): Promise<void> {
    await this.pointDataService.uploadCsv(
      pointDataData,
      params.pointDataCategory,
      params.countryCodeISO3,
    );
  }

  @ApiOperation({ summary: 'Upload community notification' })
  @ApiResponse({
    status: 201,
    description: 'Uploaded community notification.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('community-notification/:countryCodeISO3')
  public async uploadCommunityNotification(
    @Param() params,
    @Body() communityNotification: any,
  ): Promise<void> {
    return await this.pointDataService.uploadCommunityNotification(
      params.countryCodeISO3,
      communityNotification,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Dismiss community notification' })
  @ApiResponse({
    status: 201,
    description: 'Dismissed community notification.',
  })
  @ApiParam({ name: 'pointDataId', required: true, type: 'string' })
  @Put('community-notification/:pointDataId')
  public async dismissCommunityNotification(@Param() params): Promise<void> {
    return await this.pointDataService.dismissCommunityNotification(
      params.pointDataId,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Upload asset exposure status' })
  @ApiResponse({
    status: 201,
    description: 'Uploaded asset exposure status.',
  })
  @Post('exposure-status')
  public async uploadAssetExposureStatus(
    @Body() assetFids: UploadAssetExposureStatusDto,
  ): Promise<void> {
    return await this.pointDataService.uploadAssetExposureStatus(assetFids);
  }

  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Upload dynamic point data' })
  @ApiResponse({
    status: 201,
    description: 'Uploaded dynamic point data.',
  })
  @Post('dynamic')
  public async uploadDynamicPointData(
    @Body() dynamicPointData: UploadDynamicPointDataDto,
  ): Promise<void> {
    return await this.pointDataService.uploadDynamicPointData(dynamicPointData);
  }
}
