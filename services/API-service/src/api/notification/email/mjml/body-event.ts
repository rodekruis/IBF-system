import { NumberFormat } from '../../../../shared/enums/number-format.enum';
import { ContentEventEmail } from '../../dto/content-trigger-email.dto';
import { TriggerStatusLabelEnum } from '../../dto/notification-date-per-event.dto';
import {
  dateObjectToDateTimeString,
  getDisasterIssuedLabel,
  getIbfHexColor,
  getInlineImage,
  getSectionElement,
  getTextElement,
  getTimeFromNow,
  getTimezoneDisplay,
  getTotalAffected,
  getTriangleIcon,
} from '../../helpers/mjml.helper';

const getMjmlBodyEvent = ({
  color,
  defaultAdminAreaLabel,
  disasterIssuedLabel,
  disasterTypeLabel,
  eventName,
  firstLeadTimeFromNow,
  firstLeadTimeString,
  firstTriggerLeadTimeFromNow,
  firstTriggerLeadTimeString,
  indicatorLabel,
  issuedDate,
  nrOfTriggeredAreas,
  timeZone,
  totalAffected,
  triangleIcon,
  eapLink,
  triggerStatusLabel,
  toCompactNumberWithFormat,
}: {
  color: string;
  defaultAdminAreaLabel: string;
  disasterIssuedLabel: string;
  disasterTypeLabel: string;
  eventName: string;
  firstLeadTimeFromNow: string;
  firstLeadTimeString: string;
  firstTriggerLeadTimeFromNow: string;
  firstTriggerLeadTimeString: string;
  indicatorLabel: string;
  issuedDate: string;
  nrOfTriggeredAreas: number;
  timeZone: string;
  totalAffected: number;
  triangleIcon: string;
  eapLink: string;
  triggerStatusLabel: string;
  toCompactNumberWithFormat: (value: number) => string;
}): object => {
  const icon = getInlineImage({ src: triangleIcon, size: 16 });

  const eventNameElement = getTextElement({
    attributes: { color },
    content: `${icon} <strong data-testid="event-name">${disasterTypeLabel}: ${eventName}</strong>`,
  });

  const contentContent = [];

  if (firstTriggerLeadTimeFromNow) {
    // Trigger event
    if (firstLeadTimeString !== firstTriggerLeadTimeString) {
      // Warning-to-trigger event: show start of warning first
      contentContent.push(
        `<strong>${disasterTypeLabel}:</strong> Expected to start on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`,
      );
    }
    // Either way, show start of trigger next
    contentContent.push(
      `<strong>${disasterIssuedLabel}:</strong> Expected to trigger on ${firstTriggerLeadTimeString}, ${firstTriggerLeadTimeFromNow}.`,
    );
  } else {
    // Warning event
    contentContent.push(
      `<strong>${disasterIssuedLabel}:</strong> Expected to start on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`,
    );
  }

  contentContent.push(
    `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${nrOfTriggeredAreas} (see list below)`,
  ),
    contentContent.push(
      `<strong>${indicatorLabel}:</strong> ${
        totalAffected
          ? `Approximately ${toCompactNumberWithFormat(
              totalAffected,
            )} ${indicatorLabel.toLowerCase()}`
          : 'Information is unavailable'
      }`,
    );

  contentContent.push(
    triggerStatusLabel === TriggerStatusLabelEnum.Trigger
      ? `<strong>Advisory:</strong> Activate <a href="${eapLink}">Early Action Protocol</a>`
      : `<strong>Advisory:</strong> Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  );

  const contentElement = getTextElement({
    content: contentContent.join('<br/>'),
  });

  const closingElement = getTextElement({
    content: `This ${triggerStatusLabel} was first issued by IBF on ${issuedDate} (${timeZone})`,
    attributes: {
      'padding-top': '8px',
      'font-size': '14px',
    },
  });

  return getSectionElement({
    childrenEls: [eventNameElement, contentElement, closingElement],
    attributes: { padding: '8px' },
  });
};

export const getMjmlEventListBody = (
  emailContent: ContentEventEmail,
  toCompactNumber: (value: number, format: NumberFormat) => string,
): object[] => {
  const eventList = [];

  for (const event of emailContent.dataPerEvent) {
    eventList.push(
      getMjmlBodyEvent({
        eventName: event.eventName,

        disasterTypeLabel: emailContent.disasterTypeLabel,
        triggerStatusLabel: event.triggerStatusLabel,
        issuedDate: dateObjectToDateTimeString(
          event.issuedDate,
          emailContent.country.countryCodeISO3,
        ),
        timeZone: getTimezoneDisplay(emailContent.country.countryCodeISO3),

        // Lead time details
        firstLeadTimeString: event.firstLeadTimeString,
        firstTriggerLeadTimeString: event.firstTriggerLeadTimeString,
        firstLeadTimeFromNow: getTimeFromNow(event.firstLeadTime),
        firstTriggerLeadTimeFromNow: getTimeFromNow(event.firstTriggerLeadTime),

        // Area details
        nrOfTriggeredAreas: event.nrOfTriggeredAreas,
        defaultAdminAreaLabel:
          emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),

        // Indicator details
        indicatorLabel: emailContent.indicatorMetadata.label,
        totalAffected: getTotalAffected(event),
        toCompactNumberWithFormat: (value: number) =>
          toCompactNumber(
            value,
            emailContent.indicatorMetadata.numberFormatMap,
          ),

        // EAP details
        triangleIcon: getTriangleIcon(
          event.eapAlertClass?.key,
          event.triggerStatusLabel,
        ),
        eapLink: emailContent.linkEapSop,

        disasterIssuedLabel: getDisasterIssuedLabel(
          event.eapAlertClass?.label,
          emailContent.disasterTypeLabel,
        ),
        color: getIbfHexColor(
          event.eapAlertClass?.color,
          event.triggerStatusLabel,
        ),
      }),
    );
  }
  return eventList;
};
