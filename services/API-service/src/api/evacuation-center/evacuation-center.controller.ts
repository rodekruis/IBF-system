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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { UserRole } from '../user/user-role.enum';
import { EvacuationCenterService } from './evacuation-center.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('evacuation-centers')
@Controller('evacuation-centers')
export class EvacuationCenterController {
  private readonly evacuationCenterService: EvacuationCenterService;

  public constructor(evacuationCenterService: EvacuationCenterService) {
    this.evacuationCenterService = evacuationCenterService;
  }

  @ApiOperation({
    summary: 'Get evacuation center locations and attributes for given country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Dam locations and attributes for given country.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3')
  public async getEvacuationCenters(@Param() params): Promise<GeoJson> {
    return await this.evacuationCenterService.getEvacuationCentersByCountry(
      params.countryCodeISO3,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) evacuation sites data via CSV',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded dam sites data',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors in content of CSV',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Post('upload/csv/:countryCodeISO3')
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
    @UploadedFile() evacuationCenterData,
    @Param() params,
  ): Promise<void> {
    await this.evacuationCenterService.uploadCsv(
      evacuationCenterData,
      params.countryCodeISO3,
    );
  }
}
