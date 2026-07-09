import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, SelectQueryBuilder } from 'typeorm';

import { CreateNotificationLogDto } from './dto/create-notification-log.dto';
import { NotificationLogMetricsDto } from './dto/notification-log-metrics.dto';
import { NotificationLogPageDto } from './dto/notification-log-page.dto';
import { NotificationChannel } from './enum/notification-channel.enum';
import { NOTIFICATION_LOG_PERIOD_INTERVAL } from './enum/notification-log-period.enum';
import { NotificationLogEntity } from './notifcation-log.entity';
import { NotificationLogFilters } from './notification-log-filters.interface';

@Injectable()
export class NotificationLogService {
  private logger = new Logger('NotificationLogService');

  @InjectRepository(NotificationLogEntity)
  private readonly notificationLogRepository: Repository<NotificationLogEntity>;

  createNotificationLog = ({
    channel,
    recipientCount,
    countryCodeISO3,
    disasterType,
    eventNames,
  }: CreateNotificationLogDto) => {
    this.logger.log(
      `Creating notification log for channel: ${channel}, recipientCount: ${recipientCount}, countryCodeISO3: ${countryCodeISO3}, disasterType: ${disasterType}, eventNames: ${eventNames.join(',')}`,
    );

    const notificationLog = new NotificationLogEntity();
    notificationLog.channel = channel;
    notificationLog.recipientCount = recipientCount;
    notificationLog.countryCodeISO3 = countryCodeISO3;
    notificationLog.disasterType = disasterType;
    notificationLog.eventNames = eventNames;

    return this.notificationLogRepository.save(notificationLog);
  };

  readNotificationLogs = async (
    filters: NotificationLogFilters,
    page: number,
    pageSize: number,
  ): Promise<NotificationLogPageDto> => {
    const [logs, total] = await this.filteredQuery(filters)
      .orderBy('log."createdAt"', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { logs, total };
  };

  readNotificationLogMetrics = async ({
    period,
    countryCodesISO3,
    disasterTypes,
  }: NotificationLogFilters): Promise<NotificationLogMetricsDto> => {
    const { schema, tableName } = this.notificationLogRepository.metadata;

    const [metrics] = (await this.notificationLogRepository.query(
      `WITH filtered AS (
          SELECT *
            FROM "${schema}"."${tableName}"
            WHERE ($1::interval IS NULL OR "createdAt" >= now() - $1::interval)
              AND ($2::varchar[] IS NULL OR "countryCodeISO3" = ANY($2::varchar[]))
              AND ($3::varchar[] IS NULL OR "disasterType" = ANY($3::varchar[]))
        )
        SELECT
          (SELECT COUNT(DISTINCT ("countryCodeISO3", "disasterType", "eventName"))
            FROM filtered, unnest("eventNames") AS "eventName")::int AS "events",
          (SELECT COALESCE(SUM("recipientCount"), 0) FROM filtered
            WHERE "channel" = '${NotificationChannel.EMAIL}')::int AS "email",
          (SELECT COALESCE(SUM("recipientCount"), 0) FROM filtered
            WHERE "channel" = '${NotificationChannel.WHATSAPP}')::int AS "whatsapp"`,
      [
        NOTIFICATION_LOG_PERIOD_INTERVAL[period],
        countryCodesISO3.length > 0 ? countryCodesISO3 : null,
        disasterTypes.length > 0 ? disasterTypes : null,
      ],
    )) as [NotificationLogMetricsDto];

    return metrics;
  };

  private filteredQuery = ({
    period,
    countryCodesISO3,
    disasterTypes,
  }: NotificationLogFilters): SelectQueryBuilder<NotificationLogEntity> => {
    const query = this.notificationLogRepository.createQueryBuilder('log');

    const interval = NOTIFICATION_LOG_PERIOD_INTERVAL[period];
    if (interval) {
      query.andWhere(`log."createdAt" >= now() - interval '${interval}'`);
    }

    if (countryCodesISO3.length > 0) {
      query.andWhere('log."countryCodeISO3" IN (:...countryCodesISO3)', {
        countryCodesISO3,
      });
    }

    if (disasterTypes.length > 0) {
      query.andWhere('log."disasterType" IN (:...disasterTypes)', {
        disasterTypes,
      });
    }

    return query;
  };
}
