import {
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
import { DynamicDataUnit } from '../admin-area-dynamic-data/enum/dynamic-data-unit';
import { GeoJson } from '../data/geo.model';
import { AdminAreaDataService } from './admin-area-data.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('adminAreaData')
@Controller('adminAreaData')
export class AdminAreaDataController {
  private readonly adminAreaDataService: AdminAreaDataService;

  public constructor(adminAreaDataService: AdminAreaDataService) {
    this.adminAreaDataService = adminAreaDataService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload admin-area data',
  })
  @Post('upload')
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
  public async upload(@UploadedFile() adminAreaData): Promise<void> {
    await this.adminAreaDataService.updateOrCreate(adminAreaData);
  }

  @ApiOperation({ summary: 'Get admin-area data' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'key', required: true, type: 'string' })
  @Get(':countryCodeISO3/:adminLevel/:key')
  public async getAdminAreaData(
    @Param() params,
  ): Promise<AdminDataReturnDto[]> {
    return await this.adminAreaDataService.getAdminAreaData(
      params.countryCodeISO3,
      params.adminLevel,
      params.key as DynamicDataUnit,
    );
  }
}
