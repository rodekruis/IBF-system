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
    summary: 'Get available countries including their attributes',
  })
  @ApiParam({ name: 'countryCodesISO3', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get(':countryCodesISO3')
  public async getCountries(@Param() params): Promise<CountryEntity[]> {
    return await this.countryService.findCountries(params?.countryCodesISO3);
  }
}
