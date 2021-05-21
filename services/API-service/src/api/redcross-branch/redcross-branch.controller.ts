import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { RedcrossBranchEntity } from './redcross-branch.entity';
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

  // NOTE: this endpoint is to be used by the IBF-dashboard instead of the current one in data.controller.ts > TO DO
  @ApiOperation({ summary: 'Get Red Cross branches by country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get(':countryCodeISO3')
  public async getBranches(@Param() params): Promise<RedcrossBranchEntity[]> {
    return await this.redcrossBranchService.getBranchesByCountry(
      params.countryCodeISO3,
    );
  }
}
