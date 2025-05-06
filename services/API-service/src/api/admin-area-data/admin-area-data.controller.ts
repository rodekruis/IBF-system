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
import { DynamicDataPlaceCodeDto } from '../admin-area-dynamic-data/dto/dynamic-data-place-code.dto';
import { StaticIndicator } from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { AdminLevel } from '../country/admin-level.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaDataService } from './admin-area-data.service';
import {
  AdminAreaDataJsonDto,
  AdminAreaDataParams,
} from './dto/admin-area-data.dto';

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
  @ApiResponse({ status: 201, description: 'Uploaded static admin-area data' })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @Post('upload/csv')
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_API_FORMAT)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadCsv(@UploadedFile() csvFile: Express.Multer.File) {
    await this.adminAreaDataService.uploadCsv(csvFile);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) static admin-area data via JSON',
  })
  @ApiResponse({ status: 201, description: 'Uploaded static admin-area data' })
  @Post('upload/json')
  @ApiConsumes()
  @UseInterceptors()
  public async uploadJson(@Body() adminAreaDataJsonDto: AdminAreaDataJsonDto) {
    await this.adminAreaDataService.uploadJson(adminAreaDataJsonDto);
  }

  @ApiOperation({
    summary:
      'Get static indicator data per admin-area for given indicator and country.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Static data per admin-area for given indicator and country',
    type: [AdminDataReturnDto],
  })
  @Get(':countryCodeISO3/:adminLevel/:indicator')
  public async getAdminAreaData(@Param() params: AdminAreaDataParams) {
    return await this.adminAreaDataService.getAdminAreaData(
      params.countryCodeISO3,
      params.adminLevel,
      params.indicator,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Update admin area data' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, enum: AdminLevel })
  @ApiParam({
    name: 'indicator',
    required: true,
    enum: StaticIndicator,
    schema: { default: StaticIndicator.populationTotal },
  })
  @ApiBody({
    description: 'Array of admin area data',
    type: [DynamicDataPlaceCodeDto],
  })
  @ApiResponse({ status: 200, description: 'Updated admin area data' })
  @Post(':countryCodeISO3/:adminLevel/:indicator')
  @UseInterceptors()
  public async postAdminAreaData(
    @Param()
    params: AdminAreaDataParams,
    @Body() dynamicDataPlaceCodeDtos: DynamicDataPlaceCodeDto[],
  ) {
    const adminAreaDataJsonDto = new AdminAreaDataJsonDto();

    adminAreaDataJsonDto.countryCodeISO3 = params.countryCodeISO3;
    adminAreaDataJsonDto.adminLevel = params.adminLevel;
    adminAreaDataJsonDto.indicator = params.indicator;
    adminAreaDataJsonDto.dataPlaceCode = dynamicDataPlaceCodeDtos;

    await this.adminAreaDataService.uploadJson(adminAreaDataJsonDto);
  }
}
