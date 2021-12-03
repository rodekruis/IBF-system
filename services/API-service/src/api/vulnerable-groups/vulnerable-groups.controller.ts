import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { UploadVulnerableGroupsDto } from './dto/upload-vulnerable-groups';
import { VulnerableGroupsEntity } from './vulnerable-groups.entity';
import { VulnerableGroupsService } from './vulnerable-groups.service';


@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('vulnerable-groups')
@Controller('vulnerable-groups')
export class VulnerableGroupsController {
  private readonly vulnerableGroupsService: VulnerableGroupsService;

  public constructor(vulnerableGroupsService: VulnerableGroupsService) {
    this.vulnerableGroupsService = vulnerableGroupsService;
  }

  @ApiOperation({
    summary: 'Upload vulnerable groups data (used by IBF Typhoon pipeline)',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded typhoon vulnerable groups data',
    type: [VulnerableGroupsEntity],
  })
  @Post()
  public async uploadVulnerableGroups(
    @Body() uploadVulnerableGroups: UploadVulnerableGroupsDto,
  ): Promise<void> {
    return await this.vulnerableGroupsService .uploadVulnerableGroups(
      uploadVulnerableGroups,
    );
  }

  @ApiOperation({
    summary: 'Get Vulnerable groups data for given country and leadtime',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Vulnerable groups data for given country and leadtime in GEOJSON format.',
    type: GeoJson,
  })
  @Get(':countryCodeISO3/:leadTime')
  public async getVulnerableGroups(@Param() params): Promise<GeoJson> {
    return await this.vulnerableGroupsService.getVulnerableGroups(
      params.countryCodeISO3,
      params.leadTime,
    );
  }
}
