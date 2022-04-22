import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

@ApiBearerAuth()
@ApiTags('country')
@Controller('country')
export class CountryController {
  private readonly countryService: CountryService;

  public constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

  @ApiOperation({
    summary: 'Get all countries including their attributes',
  })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get()
  public async getAllCountries(): Promise<CountryEntity[]> {
    return await this.countryService.getAllCountries();
  }

  @ApiOperation({
    summary: 'Get countries including their attributes by list of countryCodes',
  })
  @ApiParam({ name: 'countryCodesISO3', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get(':countryCodesISO3')
  public async getCountries(@Param() params): Promise<CountryEntity[]> {
    return await this.countryService.getCountries(params?.countryCodesISO3);
  }
}
