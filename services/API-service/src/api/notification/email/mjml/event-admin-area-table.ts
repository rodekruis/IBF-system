import { IndicatorMetadataEntity } from '../../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../../dto/content-trigger-email.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../../dto/notification-date-per-event.dto';
import {
  COLOR_WHITE,
  getAdminAreaTable,
  getIbfHexColor,
  getInlineImage,
  getReturnElement,
  getTextElement,
  getTriangleIcon,
} from '../../helpers/mjml.helper';

const getMjmlEventAdminAreaTable = ({
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

  const icon = getInlineImage({ src: triangleIcon, size: 14 });

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

export const getMjmlAdminAreaTableList = (
  emailContent: ContentEventEmail,
): object[] => {
  const adminAreaTableList = [];

  const adminAreaLabelsParent =
    emailContent.country.adminRegionLabels[
      String(Math.max(1, emailContent.defaultAdminLevel - 1))
    ];

  for (const event of emailContent.dataPerEvent) {
    adminAreaTableList.push(
      getMjmlEventAdminAreaTable({
        disasterTypeLabel: emailContent.disasterTypeLabel,
        color: getIbfHexColor(
          event.eapAlertClass?.color,
          event.triggerStatusLabel,
        ),
        defaultAdminAreaLabel: emailContent.defaultAdminAreaLabel,
        defaultAdminAreaParentLabel: adminAreaLabelsParent,
        indicatorMetadata: emailContent.indicatorMetadata,
        event,
        triangleIcon: getTriangleIcon(
          event.eapAlertClass?.key,
          event.triggerStatusLabel,
        ),
      }),
    );
  }
  return adminAreaTableList;
};
