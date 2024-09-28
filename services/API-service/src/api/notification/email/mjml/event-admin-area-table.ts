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
  getSectionElement,
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
  toCompactNumber,
}: {
  disasterTypeLabel: string;
  color: string;
  defaultAdminAreaLabel: AdminAreaLabel;
  defaultAdminAreaParentLabel: AdminAreaLabel;
  indicatorMetadata: IndicatorMetadataEntity;
  event: NotificationDataPerEventDto;
  triangleIcon: string;
  toCompactNumber: (value: number) => string;
}) => {
  const isTrigger = event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger;

  const icon = getInlineImage({ src: triangleIcon, size: 14 });

  const titleElement = getTextElement({
    content: `${icon}<strong>${disasterTypeLabel} ${event.triggerStatusLabel} ${event.eventName}</strong>`,
    attributes: {
      color,
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '8px 24px',
    },
  });

  const subtitleElement = getTextElement({
    content: `Expected exposed ${defaultAdminAreaLabel.plural}${
      isTrigger ? ' in order of ' + indicatorMetadata.label : ''
    }`,
    attributes: {
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '0',
      'font-size': '14px',
    },
  });

  const adminAreaList = event.triggeredAreas.map((triggeredArea) => {
    return {
      exposed: toCompactNumber(triggeredArea.actionsValue),
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

  return getSectionElement({
    childrenEls: [titleElement, subtitleElement, adminAreaTable],
    attributes: {
      'padding-bottom': '24px',
    },
  });
};

export const getMjmlAdminAreaDisclaimer = (): object => {
  return getSectionElement({
    childrenEls: [
      getTextElement({
        content:
          'All numbers are approximate and meant to be used as guidance.',
        attributes: {
          align: 'center',
          'font-size': '14px',
        },
      }),
    ],
  });
};

export const getMjmlAdminAreaTableList = (
  emailContent: ContentEventEmail,
  toCompactNumber: (value: number) => string,
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
        toCompactNumber,
      }),
    );
  }
  return adminAreaTableList;
};
