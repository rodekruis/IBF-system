import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from './admin-area-notification-info.dto';
import { NotificationDataPerEventDto } from './notification-date-per-event.dto';

export class ContentEventEmail {
  public disasterType: DisasterType;
  public disasterTypeLabel: string;
  public indicatorMetadata: IndicatorMetadataEntity;
  public linkEapSop: string;
  public dataPerEvent: NotificationDataPerEventDto[];
  public mapImageData: unknown[];
  public defaultAdminLevel: number;
  public defaultAdminAreaLabel: AdminAreaLabel;
  public country: CountryEntity; // Ensure that is has the following relations 'disasterTypes', 'notificationInfo','countryDisasterSettings','countryDisasterSettings.activeLeadTimes',
}