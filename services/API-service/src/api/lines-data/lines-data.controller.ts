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
import { LinesDataService } from './lines-data.service';
import { UploadAssetExposureStatusDto } from './dto/upload-asset-exposure-status.dto';

@ApiBearerAuth()
@ApiTags('lines-data')
@Controller('lines-data')
export class LinesDataController {
  public constructor(private readonly linesDataService: LinesDataService) {}

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get lines data locations and attributes for given country and lines data layer',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'linesDataCategory', required: true, type: 'string' })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Retrieved lines data locations and attributes for given country and lines data layer',
    type: GeoJson,
  })
  @Get(':linesDataCategory/:countryCodeISO3')
  public async getLinesData(@Param() params, @Query() query): Promise<GeoJson> {
    return await this.linesDataService.getLinesDataByCountry(
      params.linesDataCategory,
      params.countryCodeISO3,
      query.leadTime,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Upload (and overwrite) via CSV lines data locations and attributes for given country and lines data layer',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded lines data locations and attributes',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @ApiParam({ name: 'linesDataCategory', required: true, type: 'string' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('upload-csv/:linesDataCategory/:countryCodeISO3')
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
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(
    @UploadedFile() linesDataData,
    @Param() params,
  ): Promise<void> {
    await this.linesDataService.uploadCsv(
      linesDataData,
      params.linesDataCategory,
      params.countryCodeISO3,
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
    return await this.linesDataService.uploadAssetExposureStatus(assetFids);
  }
}
