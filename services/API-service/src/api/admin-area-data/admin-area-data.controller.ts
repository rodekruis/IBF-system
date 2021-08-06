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
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { DynamicIndicator } from '../admin-area-dynamic-data/enum/dynamic-data-unit';
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

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload (and overwrite) indicator data via CSV',
  })
  @Post('upload/csv')
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
  public async uploadCsv(@UploadedFile() adminAreaData): Promise<void> {
    await this.adminAreaDataService.uploadCsv(adminAreaData);
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload (and overwrite) indicator data via JSON',
  })
  @Post('upload/json')
  @ApiConsumes()
  @UseInterceptors()
  public async uploadJson(
    @Body() dataPlaceCode: UploadAdminAreaDataJsonDto,
  ): Promise<void> {
    await this.adminAreaDataService.uploadJson(dataPlaceCode);
  }

  @ApiOperation({ summary: 'Get admin-area data' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'indicator', required: true, type: 'string' })
  @Get(':countryCodeISO3/:adminLevel/:indicator')
  public async getAdminAreaData(
    @Param() params,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDataService.getAdminAreaData(
      params.countryCodeISO3,
      params.adminLevel,
      params.indicator as DynamicIndicator,
    );
  }
}
