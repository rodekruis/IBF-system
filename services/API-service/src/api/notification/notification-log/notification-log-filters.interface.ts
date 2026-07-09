import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { NotificationLogPeriod } from './enum/notification-log-period.enum';

export interface NotificationLogFilters {
  period: NotificationLogPeriod;
  countryCodesISO3: string[];
  disasterTypes: DisasterType[];
}
