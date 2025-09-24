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
import { AddCountriesDto } from './dto/add-countries.dto';
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
  public async addOrUpdateCountries(
    @Body() countries: AddCountriesDto,
  ): Promise<void> {
    await this.countryService.addOrUpdateCountries(countries);
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
  public async addOrUpdateNotificationInfo(
    @Body() notificationInfo: NotificationInfoDto[],
  ): Promise<void> {
    await this.countryService.addOrUpdateNotificationInfo(notificationInfo);
  }

  @ApiOperation({
    summary: 'Get countries including their attributes by list of countryCodes',
  })
  @ApiQuery({ name: 'countryCodesISO3', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Available countries including their attributes.',
    type: [CountryEntity],
  })
  @Get()
  public async getCountries(@Query() query): Promise<CountryEntity[]> {
    return await this.countryService.getCountries(query.countryCodesISO3);
  }
}
