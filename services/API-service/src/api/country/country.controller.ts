import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('country')
@Controller('country')
export class CountryController {
  private readonly countryService: CountryService;

  public constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

  @ApiOperation({
    summary: 'Get available countries including their attributes',
  })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get()
  public async getCountries(): Promise<CountryEntity[]> {
    return await this.countryService.findAll();
  }
}
