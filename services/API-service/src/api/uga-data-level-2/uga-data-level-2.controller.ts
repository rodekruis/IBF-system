import { UgaDataLevel2Service } from './uga-data-level-2.service';
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../data/geo.model';

@ApiBearerAuth()
@ApiTags('uganda')
@Controller('uga-data-level-2')
export class UgaDataLevel2Controller {
  private readonly ugaDataLevel2Service: UgaDataLevel2Service;
  public constructor(ugaDataLevel2Service: UgaDataLevel2Service) {
    this.ugaDataLevel2Service = ugaDataLevel2Service;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload level 2 admin data. Columns: pcode covidrisk',
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
  public async upload(@UploadedFile() ugaDataLevel2List): Promise<void> {
    await this.ugaDataLevel2Service.updateOrCreate(ugaDataLevel2List);
  }

  @ApiOperation({ summary: 'Get all covid risk admin 2' })
  @Get('all')
  public async getUgandaLevel2(): Promise<GeoJson> {
    return await this.ugaDataLevel2Service.findAll();
  }
}
