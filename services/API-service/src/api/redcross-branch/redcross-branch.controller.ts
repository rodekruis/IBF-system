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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeoJson, RedCrossBranch } from '../../shared/geo.model';
import { RolesGuard } from '../../roles.guard';
import { RedcrossBranchService } from './redcross-branch.service';
import { Roles } from '../../roles.decorator';
import { UploadAdminAreaDataJsonDto } from '../admin-area-data/dto/upload-admin-area-data.dto';
import { UserRole } from '../user/user-role.enum';
import { UploadRedCrossBranchJsonDto } from './dto/upload-red-cross-branch.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('redcross-branches')
@Controller('redcross-branches')
export class RedcrossBranchController {
  private readonly redcrossBranchService: RedcrossBranchService;

  public constructor(redcrossBranchService: RedcrossBranchService) {
    this.redcrossBranchService = redcrossBranchService;
  }

  @ApiOperation({ summary: 'Get Red Cross branches for given country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Red Cross branch locations and attributes in GEOJSON format',
    type: GeoJson,
  })
  @Get(':countryCodeISO3')
  public async getBranches(@Param() params): Promise<GeoJson> {
    return await this.redcrossBranchService.getBranchesByCountry(
      params.countryCodeISO3,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Upload (and overwrite) red cross branch data via CSV',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded red cross branch data',
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
    @UploadedFile() redCrossBranchData,
    @Param() params,
  ): Promise<void> {
    await this.redcrossBranchService.uploadCsv(
      redCrossBranchData,
      params.countryCodeISO3,
    );
  }
}
