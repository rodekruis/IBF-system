import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiUseTags('country')
@Controller('country')
export class CountryController {
  private readonly countryService: CountryService;

  public constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

  @ApiOperation({ title: 'Get country data' })
  @Get()
  public async getCountries(): Promise<CountryEntity[]> {
    return await this.countryService.findAll();
  }
}
