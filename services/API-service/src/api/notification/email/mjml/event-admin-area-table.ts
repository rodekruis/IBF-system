import { IndicatorMetadataEntity } from '../../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../../dto/admin-area-notification-info.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../../dto/notification-date-per-event.dto';
import {
  COLOR_WHITE,
  getAdminAreaTable,
  getInlineTriangleIcon,
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
  triangleIcon,
}: {
  disasterTypeLabel: string;
  color: string;
  defaultAdminAreaLabel: AdminAreaLabel;
  defaultAdminAreaParentLabel: AdminAreaLabel;
  indicatorMetadata: IndicatorMetadataEntity;
  event: NotificationDataPerEventDto;
  triangleIcon: string;
}) => {
  const isTrigger = event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger;

  const icon = getInlineTriangleIcon({ src: triangleIcon });

  const titleElement = getTextElement({
    content: `${icon} <strong>${disasterTypeLabel} ${event.triggerStatusLabel} ${event.eventName}</strong>`,
    attributes: {
      color,
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '10px 25px',
    },
  });

  const subtitleElement = getTextElement({
    content: `Expected exposed ${defaultAdminAreaLabel.plural}${
      isTrigger ? ' in order of exposed ' + indicatorMetadata.label : ''
    }`,
    attributes: {
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '10px 25px',
    },
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
    attributes: {
      'padding-bottom': '20px',
    },
  });
};
