import { NumberFormat } from '../../../../shared/enums/number-format.enum';
import { IndicatorMetadataEntity } from '../../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../../dto/content-trigger-email.dto';
import { NotificationDataPerEventDto } from '../../dto/notification-date-per-event.dto';
import {
  COLOR_WHITE,
  getAdminAreaTable,
  getEventSeverityLabel,
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
  toCompactNumber: (value: number, format: NumberFormat) => string;
}) => {
  const icon = getInlineImage({ src: triangleIcon, size: 16 });

  const severityLabel = getEventSeverityLabel(event.eapAlertClass?.key);

  const titleElement = getTextElement({
    content: `${icon} <strong>${severityLabel} ${event.triggerStatusLabel} ${disasterTypeLabel}: ${event.eventName}</strong>`,
    attributes: {
      color,
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '8px 24px',
    },
  });

  const isIndicatorAvailable = event.alertAreas.some(
    ({ mainExposureValue }) => mainExposureValue,
  );

  const subtitleContent = isIndicatorAvailable
    ? `Expected exposed ${defaultAdminAreaLabel.plural.toLowerCase()} in order of ${indicatorMetadata.label.toLowerCase()}:`
    : `${indicatorMetadata.label} information is unavailable.`;

  const subtitleElement = getTextElement({
    content: subtitleContent,
    attributes: {
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: isIndicatorAvailable ? '0' : '0 0 8px',
      'font-size': '14px',
    },
  });

  const adminAreaList = event.alertAreas.map((triggeredArea) => {
    return {
      exposed: toCompactNumber(
        triggeredArea.mainExposureValue,
        indicatorMetadata.numberFormatMap,
      ),
      name: `${triggeredArea.name} ${
        triggeredArea.nameParent ? `(${triggeredArea.nameParent})` : ''
      }`,
    };
  });

  const adminAreaTable = getAdminAreaTable({
    adminAreaList,
    adminAreaLabel: defaultAdminAreaLabel.singular,
    adminAreaParentLabel: defaultAdminAreaParentLabel.singular,
    indicatorLabel: indicatorMetadata.label,
  });

  const childrenEls = [titleElement, subtitleElement];

  if (isIndicatorAvailable) {
    childrenEls.push(adminAreaTable);
  }

  return getSectionElement({
    childrenEls,
    attributes: { padding: '8px' },
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
    attributes: { padding: '8px' },
  });
};

export const getMjmlAdminAreaTableList = (
  emailContent: ContentEventEmail,
  toCompactNumber: (value: number, format: NumberFormat) => string,
): object[] => {
  const adminAreaTableList = [];

  const adminAreaParentLabel =
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
        defaultAdminAreaParentLabel: adminAreaParentLabel,
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
