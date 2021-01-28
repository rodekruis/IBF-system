import { UgaDataLevel2Service } from './uga-data-level-2.service';
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUseTags,
  ApiOperation,
  ApiImplicitFile,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Param } from '@nestjs/common';
import { GeoJson } from 'src/models/geo.model';

@ApiBearerAuth()
@ApiUseTags('uganda')
@Controller('uga-data-level-2')
export class UgaDataLevel2Controller {
  private readonly ugaDataLevel2Service: UgaDataLevel2Service;
  public constructor(ugaDataLevel2Service: UgaDataLevel2Service) {
    this.ugaDataLevel2Service = ugaDataLevel2Service;
  }

  // @UseGuards(RolesGuard)
  @ApiOperation({ title: 'Upload level 2 data' })
  @ApiImplicitFile({
    name: 'file',
    required: false,
    description: 'Upload level 2 admin data. Columns: pcode covidrisk',
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  public async upload(@UploadedFile() ugaDataLevel2List): Promise<void> {
    await this.ugaDataLevel2Service.updateOrCreate(ugaDataLevel2List);
  }

  @ApiOperation({ title: 'Get all covid risk admin 2' })
  @Get('all')
  public async getUgandaLevel2(): Promise<GeoJson> {
    return await this.ugaDataLevel2Service.findAll();
  }
}
