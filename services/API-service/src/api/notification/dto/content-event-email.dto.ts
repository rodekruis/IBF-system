import { Event } from '../../../shared/data.model';
import { CountryEntity } from '../../country/country.entity';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from './admin-area-notification-info.dto';

export class ContentEventEmail {
  public disasterType: DisasterTypeEntity;
  public mainExposureIndicatorMetadata: IndicatorMetadataEntity;
  public eapLink: string;
  public events: Event[];
  public defaultAdminLevel: number;
  public defaultAdminAreaLabel: AdminAreaLabel;
  public country: CountryEntity; // Ensure that is has the following relations 'disasterTypes', 'notificationInfo','countryDisasterSettings','countryDisasterSettings.activeLeadTimes',
  public lastUploadDate: LastUploadDateDto;
}
