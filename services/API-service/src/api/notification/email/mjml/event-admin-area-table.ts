import { IndicatorMetadataEntity } from '../../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../../dto/admin-area-notification-info.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../../dto/notification-date-per-event.dto';
import {
  getAdminAreaTable,
  getReturnElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlEventAdminAreaTable = ({
  disasterTypeLabel,
  color,
  defaultAdminAreaLabel,
  defaultAdminAreaParentLabel,
  indicatorMetadata,
  event,
}: {
  disasterTypeLabel: string;
  color: string;
  defaultAdminAreaLabel: AdminAreaLabel;
  defaultAdminAreaParentLabel: AdminAreaLabel;
  indicatorMetadata: IndicatorMetadataEntity;
  event: NotificationDataPerEventDto;
}) => {
  const isTrigger = event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger;

  const titleElement = getTextElement({
    content: `<strong>${disasterTypeLabel} ${event.triggerStatusLabel} ${event.eventName}</strong>`,
    attributes: { color },
  });

  const subtitleElement = getTextElement({
    content: `Expected exposed ${defaultAdminAreaLabel.plural}${
      isTrigger ? 'in order of exposed ' + indicatorMetadata.label : ''
    }`,
    attributes: { color: event.eapAlertClass.color },
  });

  const adminAreaList = event.triggeredAreas.map((triggeredArea) => {
    return {
      exposed: triggeredArea.actionsValue,
      name: `${triggeredArea.name} (${triggeredArea.nameParent})`,
    };
  });

  const adminAreaTable = getAdminAreaTable({
    adminAreaList,
    adminAreaLabel: defaultAdminAreaLabel.singular,
    adminAreaParentLabel: defaultAdminAreaParentLabel.singular,
    indicatorLabel: indicatorMetadata.label,
    isTrigger,
  });

  return getReturnElement({
    childrenEls: [titleElement, subtitleElement, adminAreaTable],
    attributes: { 'background-color': 'white' },
  });
};
