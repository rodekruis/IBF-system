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
import { FILE_UPLOAD_API_FORMAT } from '../../shared/file-upload-api-format';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { AdminLevel } from '../country/admin-level.enum';
import { countriesEnum } from '../country/country.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaDataService } from './admin-area-data.service';
import { UploadAdminAreaDataJsonDto } from './dto/upload-admin-area-data.dto';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-area-data')
@Controller('admin-area-data')
export class AdminAreaDataController {
  private readonly adminAreaDataService: AdminAreaDataService;

  public constructor(adminAreaDataService: AdminAreaDataService) {
    this.adminAreaDataService = adminAreaDataService;
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) static admin-area data via CSV',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded static admin-area data',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @Post('upload/csv')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_API_FORMAT)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(@UploadedFile() adminAreaData): Promise<void> {
    await this.adminAreaDataService.uploadCsv(adminAreaData);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) static admin-area data via JSON',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded static admin-area data',
  })
  @Post('upload/json')
  @ApiConsumes()
  @UseInterceptors()
  public async uploadJson(
    @Body() dataPlaceCode: UploadAdminAreaDataJsonDto,
  ): Promise<void> {
    await this.adminAreaDataService.uploadJson(dataPlaceCode);
  }

  @ApiOperation({
    summary:
      'Get static indicator data per admin-area for given indicator and country.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'adminLevel', required: true, enum: AdminLevel })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Static data per admin-area for given indicator and country',
    type: [AdminDataReturnDto],
  })
  @Get(':countryCodeISO3/:adminLevel/:indicator')
  public async getAdminAreaData(
    @Param() params,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDataService.getAdminAreaData(
      params.countryCodeISO3,
      params.adminLevel,
      params.indicator,
    );
  }
}
