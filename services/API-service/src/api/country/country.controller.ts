import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { UserRole } from '../user/user-role.enum';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';
import { UpsertCountriesDto } from './dto/country.dto';
import { NotificationInfoDto } from './dto/notification-info.dto';

@ApiTags('country')
@Controller('country')
export class CountryController {
  private readonly countryService: CountryService;

  public constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) country' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated country-properties.',
  })
  @Post()
  public async upsertCountries(@Body() { countries }: UpsertCountriesDto) {
    await this.countryService.upsertCountries(countries);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Add/update notification info for given countries' })
  @ApiResponse({
    status: 201,
    description: 'notification info added or updated',
  })
  @Post('notification-info')
  public async upsertNotificationInfo(
    @Body() notificationInfo: NotificationInfoDto[],
  ): Promise<void> {
    await this.countryService.upsertNotificationInfo(notificationInfo);
  }

  @ApiOperation({
    summary: 'Get countries including their attributes by list of countryCodes',
  })
  @ApiQuery({ name: 'countryCodesISO3', required: false, type: 'string' })
  @ApiQuery({
    name: 'minimalInfo',
    required: false,
    type: 'boolean',
    default: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get()
  public async getCountries(
    @Query()
    {
      countryCodesISO3,
      minimalInfo,
    }: Partial<{ countryCodesISO3: string; minimalInfo: string }>,
  ): Promise<CountryEntity[]> {
    const countryCodes = countryCodesISO3
      ?.split(',')
      .map((code) => code.trim());

    let relations: string[];
    if (minimalInfo === 'true') {
      relations = ['disasterTypes'];
    }

    return await this.countryService.getCountries(countryCodes, relations);
  }
}
