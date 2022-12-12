import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles.decorator';
import { NotificationInfoDto } from './dto/notification-info.dto';
import { UserRole } from '../user/user-role.enum';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';
import { AddCountriesDto } from './dto/add-countries.dto';

@ApiBearerAuth()
@ApiTags('country')
@Controller('country')
export class CountryController {
  private readonly countryService: CountryService;

  public constructor(countryService: CountryService) {
    this.countryService = countryService;
  }

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

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Add/update notification info for given countries',
  })
  @ApiResponse({
    status: 200,
    description: 'notification info added or updated',
  })
  @Post('notification-info')
  public async addOrUpdateNotificationInfo(
    @Body() notificationInfo: NotificationInfoDto[],
  ): Promise<void> {
    await this.countryService.addOrUpdateNotificationInfo(notificationInfo);
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
