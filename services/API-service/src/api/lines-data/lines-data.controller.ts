import {
  Body,
  Controller,
  Param,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { UserRole } from '../user/user-role.enum';
import { LinesDataService } from './lines-data.service';
import { UploadLinesExposureStatusDto } from './dto/upload-asset-exposure-status.dto';
import { FILE_UPLOAD_API_FORMAT } from '../../shared/file-upload-api-format';

@ApiBearerAuth()
@ApiTags('lines-data')
@Controller('lines-data')
export class LinesDataController {
  public constructor(private readonly linesDataService: LinesDataService) {}

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
  @ApiBody(FILE_UPLOAD_API_FORMAT)
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
    @Body() assetFids: UploadLinesExposureStatusDto,
  ): Promise<void> {
    return await this.linesDataService.uploadAssetExposureStatus(assetFids);
  }
}
