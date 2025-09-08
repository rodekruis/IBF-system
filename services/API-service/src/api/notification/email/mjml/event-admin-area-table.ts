import { AlertArea } from '../../../../shared/data.model';
import { NumberFormat } from '../../../../shared/enums/number-format.enum';
import {
  ALERT_LEVEL_COLOUR,
  ALERT_LEVEL_LABEL,
  AlertLevel,
} from '../../../event/enum/alert-level.enum';
import { IndicatorMetadataEntity } from '../../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../../dto/content-event-email.dto';
import {
  COLOR_WHITE,
  getAdminAreaTable,
  getInlineImage,
  getSectionElement,
  getTextElement,
  getTriangleIcon,
} from '../../helpers/mjml.helper';

const getMjmlEventAdminAreaTable = ({
  defaultAdminAreaLabel,
  defaultAdminAreaParentLabel,
  mainExposureIndicatorMetadata,
  eventName,
  alertAreas,
  alertLevel,
  toCompactNumber,
}: {
  defaultAdminAreaLabel: AdminAreaLabel;
  defaultAdminAreaParentLabel: AdminAreaLabel;
  mainExposureIndicatorMetadata: IndicatorMetadataEntity;
  eventName: string;
  alertAreas: AlertArea[];
  alertLevel: AlertLevel;
  toCompactNumber: (value: number, format: NumberFormat) => string;
}) => {
  const icon = getInlineImage({ src: getTriangleIcon(alertLevel), size: 16 });

  const titleElement = getTextElement({
    content: `${icon} <strong>${ALERT_LEVEL_LABEL[alertLevel]}: ${eventName}</strong>`,
    attributes: {
      color: ALERT_LEVEL_COLOUR[alertLevel],
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: '8px 24px',
    },
  });

  const isIndicatorAvailable = alertAreas.some(
    ({ mainExposureValue }) => mainExposureValue,
  );

  const subtitleContent = isIndicatorAvailable
    ? `Expected exposed ${defaultAdminAreaLabel.plural.toLowerCase()} in order of ${mainExposureIndicatorMetadata.label.toLowerCase()}:`
    : `${mainExposureIndicatorMetadata.label} information is unavailable.`;

  const subtitleElement = getTextElement({
    content: subtitleContent,
    attributes: {
      'container-background-color': COLOR_WHITE,
      align: 'center',
      padding: isIndicatorAvailable ? '0' : '0 0 8px',
      'font-size': '14px',
    },
  });

  const adminAreaList = alertAreas.map((triggeredArea) => {
    return {
      exposed: toCompactNumber(
        triggeredArea.mainExposureValue,
        mainExposureIndicatorMetadata.numberFormatMap,
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
    indicatorLabel: mainExposureIndicatorMetadata.label,
  });

  const childrenEls = [titleElement, subtitleElement];

  if (isIndicatorAvailable) {
    childrenEls.push(adminAreaTable);
  }

  return getSectionElement({ childrenEls, attributes: { padding: '8px' } });
};

export const getMjmlAdminAreaDisclaimer = (): object => {
  return getSectionElement({
    childrenEls: [
      getTextElement({
        content:
          'All numbers are approximate and meant to be used as guidance.',
        attributes: { align: 'center', 'font-size': '14px' },
      }),
    ],
    attributes: { padding: '8px' },
  });
};

export const getMjmlAdminAreaTableList = (
  {
    country,
    defaultAdminLevel,
    defaultAdminAreaLabel,
    mainExposureIndicatorMetadata,
    events,
  }: ContentEventEmail,
  toCompactNumber: (value: number, format: NumberFormat) => string,
) => {
  const defaultAdminAreaParentLabel =
    country.adminRegionLabels[String(Math.max(1, defaultAdminLevel - 1))];

  return events.map(({ alertLevel, alertAreas, eventName }) =>
    getMjmlEventAdminAreaTable({
      defaultAdminAreaLabel,
      defaultAdminAreaParentLabel,
      mainExposureIndicatorMetadata,
      eventName,
      alertAreas,
      alertLevel,
      toCompactNumber,
    }),
  );
};
