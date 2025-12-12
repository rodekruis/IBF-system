import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { UserDecorator } from '../user/user.decorator';
import { User } from '../user/user.model';
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

  @ApiOperation({ summary: 'Get countries' })
  @ApiResponse({
    status: 200,
    description: 'List of countries',
    type: [CountryEntity],
  })
  @Get()
  public async getCountries(
    @UserDecorator() user: User,
  ): Promise<CountryEntity[]> {
    let countryCodesISO3 = [];

    if (user.userRole !== UserRole.Admin) {
      countryCodesISO3 = user.countryCodesISO3;
    }

    return await this.countryService.getCountries(countryCodesISO3, [
      'disasterTypes',
    ]);
  }
}
