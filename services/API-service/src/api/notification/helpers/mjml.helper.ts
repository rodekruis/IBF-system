import * as fs from 'fs';

import { format } from 'date-fns';

import { EapAlertClassKeyEnum } from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryTimeZoneMapping } from '../../country/country-time-zone-mapping';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';

interface AdminArea {
  exposed?: string;
  name: string;
}

export const BODY_WIDTH = '768px';
export const COLOR_PRIMARY = '#4f22d7';
export const COLOR_TERTIARY = '#cfbfff';
export const COLOR_WHITE = '#ffffff';
export const COLOR_GREY = '#f4f5f8';
export const COLOR_BROWN = '#241C15';
const COLOR_WARNING_ORANGE = '#aa6009';
const COLOR_WARNING_YELLOW = '#665606';
const COLOR_TRIGGER_RED = '#8a0f32';

const emailFolder = './src/api/notification/email';
const emailIconFolder = `${emailFolder}/icons`;
const emailLogoFolder = `${emailFolder}/logos`;

const HEAD_ATTRIBUTES = {
  tagName: 'mj-attributes',
  children: [
    {
      tagName: 'mj-all',
      attributes: { 'font-family': 'Arial, sans-serif' },
    },
    {
      tagName: 'mj-text',
      attributes: { 'font-size': '16px' },
    },
  ],
};

export const EMAIL_HEAD = {
  tagName: 'mj-head',
  children: [
    HEAD_ATTRIBUTES,
    {
      tagName: 'mj-breakpoint',
      attributes: { width: '520px' },
    },
  ],
};

export const getSectionElement = ({
  childrenEls,
  backgroundColor = COLOR_GREY,
  attributes,
}: {
  childrenEls: object[];
  backgroundColor?: string;
  attributes?: object;
}) => {
  return {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        children: childrenEls,
      },
    ],
    attributes: {
      'full-width': 'full-width',
      padding: '16px',
      'background-color': backgroundColor,
      ...attributes,
    },
  };
};

export const getTextElement = ({
  content,
  attributes,
}: {
  content: string;
  attributes?: object;
}): { tagName: string; content: string; attributes?: object } => {
  return {
    tagName: 'mj-text',
    content,
    attributes: {
      'line-height': '1.5',
      padding: '0',
      ...attributes,
    },
  };
};

export const getNotificationActionsSection = ({
  buttonText,
  buttonLink,
  description,
  primary,
}: {
  buttonText: string;
  buttonLink: string;
  description: string;
  primary: boolean;
}): object => {
  return {
    tagName: 'mj-section',
    attributes: {
      padding: '0',
      'text-align': 'left',
    },
    children: [
      {
        tagName: 'mj-column',
        attributes: {
          'vertical-align': 'middle',
          padding: '8px 0 8px 0',
          width: '224px',
        },
        children: [
          {
            tagName: 'mj-raw',
            content: `<!--[if mso]>
              <div style="text-align: center">
                <v:roundrect
                  xmlns:v="urn:schemas-microsoft-com:vml"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  href="${buttonLink}"
                  style="height:38px;v-text-anchor:middle;width:200px;"
                  arcsize="50%"
                  strokecolor="${primary ? COLOR_PRIMARY : COLOR_TERTIARY}"
                  fillcolor="${primary ? COLOR_PRIMARY : COLOR_WHITE}">
                  <w:anchorlock/>
                    <center
                      style="font-size: 16px; color: ${
                        primary ? COLOR_WHITE : COLOR_PRIMARY
                      };">
                        ${buttonText}
              <![endif]-->`,
          },
          {
            tagName: 'mj-button',
            attributes: {
              href: buttonLink,
              width: '200px',
              height: '24px',
              'border-radius': '24px',
              padding: '0',
              'font-size': '16px',
              'background-color': primary ? COLOR_PRIMARY : COLOR_WHITE,
              color: primary ? COLOR_WHITE : COLOR_PRIMARY,
              border: `1px solid ${primary ? COLOR_PRIMARY : COLOR_TERTIARY}`,
            },
            content: buttonText,
          },
          {
            tagName: 'mj-raw',
            content: '<!--[if mso]></center></v:roundrect></div><![endif]-->',
          },
        ],
      },
      {
        tagName: 'mj-column',
        attributes: {
          width: '512px',
          'vertical-align': 'middle',
          padding: '4px',
        },
        children: [
          getTextElement({
            content: description,
          }),
        ],
      },
    ],
  };
};

export const getAdminAreaTable = ({
  indicatorLabel,
  adminAreaLabel,
  adminAreaParentLabel,
  adminAreaList,
}: {
  indicatorLabel: string;
  adminAreaLabel: string;
  adminAreaParentLabel: string;
  adminAreaList: AdminArea[];
}) => {
  const header = `
    <tr>
      <th align="right">${indicatorLabel}</th>
      <th align="left">${adminAreaLabel} ${
    adminAreaLabel === adminAreaParentLabel ? '' : `(${adminAreaParentLabel})`
  }</th>
    </tr>
  `;

  const row = (adminArea: AdminArea) => `
    <tr>
      <td align="right">${adminArea.exposed}</td>
      <td align="left">${adminArea.name}</td>
    </tr>
  `;
  const rows = adminAreaList.map((adminArea) => row(adminArea)).join('');

  const tbody = `${header}${rows}`;

  return {
    tagName: 'mj-table',
    content: tbody,
    attributes: {
      'container-background-color': COLOR_WHITE,
      cellpadding: '4',
      'table-layout': 'fixed',
    },
  };
};

export const getInlineImage = ({
  src,
  size,
}: {
  src: string;
  size: number;
}): string =>
  `<img src="${src}" width="${size}" height="${size}" style="display: inline-block; width: ${size}px; height: ${size}px; max-width: ${size}px; max-height: ${size}px; vertical-align: text-top;"></img>`;

export const getImageElement = ({
  src,
  attributes,
}: {
  src: string;
  attributes?: object;
}): object => {
  return {
    tagName: 'mj-image',
    attributes: { src, ...attributes },
  };
};

export const dateObjectToDateTimeString = (
  date: Date,
  countryCodeISO3: string,
): string => {
  const timeZone = CountryTimeZoneMapping[countryCodeISO3];
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone,
  };
  return date.toLocaleString('default', options);
};

export const getTimezoneDisplay = (countryCodeISO3: string) => {
  return CountryTimeZoneMapping[countryCodeISO3].split('_').join(' ');
};

export const getTimeFromNow = (leadTime: LeadTime) => {
  if (!leadTime) return '';

  const leadTimeQuantity = parseInt(leadTime.split('-')[0]);

  return [LeadTime.day0, LeadTime.month0, LeadTime.hour0].includes(leadTime)
    ? 'ongoing'
    : `${leadTime.replace('-', ' ')}${
        leadTimeQuantity === 1 ? '' : 's'
      } from now`;
};

export const getTotalAffected = (
  event: NotificationDataPerEventDto,
): number | null => {
  return event.totalAffectedOfIndicator ?? null;
};

export const getTriangleIcon = (
  eapAlertClassKey: EapAlertClassKeyEnum,
  triggerStatusLabel: TriggerStatusLabelEnum,
) => {
  const fileNameMap = {
    [EapAlertClassKeyEnum.med]: 'warning-medium.png',
    [EapAlertClassKeyEnum.min]: 'warning-low.png',
    [EapAlertClassKeyEnum.max]: 'trigger.png',
    default: 'trigger.png',
  };

  let fileName = eapAlertClassKey
    ? fileNameMap[eapAlertClassKey]
    : fileNameMap.default;
  if (
    !eapAlertClassKey &&
    triggerStatusLabel !== TriggerStatusLabelEnum.Trigger
  ) {
    fileName = 'warning-medium.png';
  }
  const filePath = `${emailIconFolder}/${fileName}`;
  return getPngImageAsDataURL(filePath);
};

export const getEventSeverityLabel = (
  eapAlertClassKey: EapAlertClassKeyEnum,
) => {
  const severityLabels = {
    [EapAlertClassKeyEnum.med]: 'Medium',
    [EapAlertClassKeyEnum.min]: 'Low',
  };

  return severityLabels[eapAlertClassKey] || '';
};

export const getPngImageAsDataURL = (relativePath: string) => {
  const imageBuffer = fs.readFileSync(relativePath);
  const imageDataURL = `data:image/png;base64,${imageBuffer.toString(
    'base64',
  )}`;

  return imageDataURL;
};

export const getDisasterIssuedLabel = (
  eapLabel: string,
  disasterTypeLabel: string,
) => {
  return eapLabel || disasterTypeLabel;
};

export const getIbfHexColor = (
  color: string,
  triggerStatusLabel: TriggerStatusLabelEnum,
): string => {
  // Color  defined in the EAP Alert Class. This is only used for flood events
  // For other events, the color is defined in the disaster settings
  // So we decide it based on the trigger status label

  if (color) {
    // TODO: Define in a place where FrontEnd and Backend can share this
    switch (color) {
      case 'ibf-orange':
        return COLOR_WARNING_ORANGE;
      case 'fiveten-yellow-500':
        return COLOR_WARNING_YELLOW;
      default:
        return COLOR_TRIGGER_RED;
    }
  }
  return triggerStatusLabel === TriggerStatusLabelEnum.Trigger
    ? COLOR_TRIGGER_RED
    : COLOR_WARNING_ORANGE;
};

export const getLogoImageAsDataURL = () => {
  const filePath = `${emailLogoFolder}/logo-IBF.png`;
  return getPngImageAsDataURL(filePath);
};

export const getFormattedDate = ({
  date,
  countryCodeISO3,
}: {
  date: Date;
  countryCodeISO3?: string;
}): string => {
  return `${format(date, 'EEEE, dd MMMM')}${
    countryCodeISO3
      ? CountryTimeZoneMapping[countryCodeISO3].split('_').join(' ')
      : ''
  }`;
};
