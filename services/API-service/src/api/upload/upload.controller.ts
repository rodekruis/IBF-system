import { Body } from '@nestjs/common';
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadExposureDto } from './dto/upload-exposure.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  private readonly uploadService: UploadService;
  public constructor(uploadService: UploadService) {
    this.uploadService = uploadService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Upload exposure data at a regular interval',
  })
  @Post('exposure')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(
    @Body() placeCodeExposure: UploadExposureDto,
  ): Promise<void> {
    await this.uploadService.exposure(placeCodeExposure);
  }
}
