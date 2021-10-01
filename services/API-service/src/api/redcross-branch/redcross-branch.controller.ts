import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeoJson, RedCrossBranch } from '../../shared/geo.model';
import { RolesGuard } from '../../roles.guard';
import { RedcrossBranchService } from './redcross-branch.service';

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
}
