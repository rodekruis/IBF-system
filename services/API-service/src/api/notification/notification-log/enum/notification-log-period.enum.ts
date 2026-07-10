export enum NotificationLogPeriod {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
}

export const NOTIFICATION_LOG_PERIOD_INTERVAL: Record<
  NotificationLogPeriod,
  string | null
> = {
  [NotificationLogPeriod.MONTH]: '1 month',
  [NotificationLogPeriod.QUARTER]: '3 months',
  [NotificationLogPeriod.YEAR]: '1 year',
  [NotificationLogPeriod.ALL]: null,
};
