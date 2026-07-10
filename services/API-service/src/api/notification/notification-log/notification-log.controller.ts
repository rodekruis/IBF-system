import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { Roles } from '../../../roles.decorator';
import { RolesGuard } from '../../../roles.guard';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { UserDecorator } from '../../user/user.decorator';
import { User } from '../../user/user.model';
import { UserRole } from '../../user/user-role.enum';
import { NotificationLogMetricsDto } from './dto/notification-log-metrics.dto';
import { NotificationLogPageDto } from './dto/notification-log-page.dto';
import { NotificationLogPeriod } from './enum/notification-log-period.enum';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogFilters } from './notification-log-filters.interface';

const PAGE_SIZE = 10;

@ApiTags('notification')
@Controller('notification/log')
export class NotificationLogController {
  public constructor(
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.LocalAdmin)
  @ApiOperation({
    summary: `Get notification logs, most recent first, paginated per ${PAGE_SIZE}. Pass metrics=true to get aggregated metrics instead.`,
  })
  @ApiQuery({
    name: 'metrics',
    required: false,
    type: 'boolean',
    description:
      'If true, return aggregated metrics instead of paginated logs.',
  })
  @ApiQuery({ name: 'period', required: false, enum: NotificationLogPeriod })
  @ApiQuery({
    name: 'countryCodesISO3',
    required: false,
    type: 'string',
    description: 'Comma-separated country codes, e.g. ETH,KEN',
  })
  @ApiQuery({
    name: 'disasterTypes',
    required: false,
    type: 'string',
    description: 'Comma-separated disaster types, e.g. floods,drought',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Ignored when metrics=true.',
  })
  @ApiExtraModels(NotificationLogPageDto, NotificationLogMetricsDto)
  @ApiResponse({
    status: 200,
    description:
      'Paginated notification logs with total count, or aggregated metrics when metrics=true.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(NotificationLogPageDto) },
        { $ref: getSchemaPath(NotificationLogMetricsDto) },
      ],
    },
  })
  @Get()
  public async readNotificationLogs(
    @UserDecorator() user: User,
    @Query('metrics', new ParseBoolPipe({ optional: true })) metrics?: boolean,
    @Query(
      'period',
      new ParseEnumPipe(NotificationLogPeriod, { optional: true }),
    )
    period?: NotificationLogPeriod,
    @Query('countryCodesISO3') countryCodesISO3?: string,
    @Query('disasterTypes') disasterTypes?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<NotificationLogMetricsDto | NotificationLogPageDto> {
    const filters = this.parseFilters(
      user,
      period,
      countryCodesISO3,
      disasterTypes,
    );

    if (metrics) {
      return await this.notificationLogService.readNotificationLogMetrics(
        filters,
      );
    }

    return await this.notificationLogService.readNotificationLogs(
      filters,
      Math.max(1, page ?? 1),
      PAGE_SIZE,
    );
  }

  private parseFilters(
    user: User,
    period?: NotificationLogPeriod,
    countryCodesISO3?: string,
    disasterTypes?: string,
  ): NotificationLogFilters {
    const parseList = (list?: string) =>
      list
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

    const parsedDisasterTypes = parseList(disasterTypes) as DisasterType[];
    for (const disasterType of parsedDisasterTypes) {
      if (!Object.values(DisasterType).includes(disasterType)) {
        throw new BadRequestException(`Unknown disaster type: ${disasterType}`);
      }
    }

    // scope to the user's own countries, same logic as GET user
    const requestedCountryCodesISO3 = parseList(countryCodesISO3);
    for (const requestedCountryCodeISO3 of requestedCountryCodesISO3) {
      if (!user.countryCodesISO3.includes(requestedCountryCodeISO3)) {
        const message = `You cannot view notifications from country ${requestedCountryCodeISO3}`;
        throw new ForbiddenException(message);
      }
    }

    let scopedCountryCodesISO3 = user.countryCodesISO3;
    if (requestedCountryCodesISO3.length > 0) {
      scopedCountryCodesISO3 = requestedCountryCodesISO3;
    }
    if (
      user.userRole === UserRole.Admin &&
      requestedCountryCodesISO3.length === 0
    ) {
      scopedCountryCodesISO3 = [];
    }

    return {
      period: period ?? NotificationLogPeriod.ALL,
      countryCodesISO3: scopedCountryCodesISO3,
      disasterTypes: parsedDisasterTypes,
    };
  }
}
