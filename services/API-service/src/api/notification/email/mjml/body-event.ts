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
  indicatorUnit,
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
  indicatorUnit: string;
  issuedDate: string;
  nrOfTriggeredAreas: number;
  timeZone: string;
  totalAffected: number;
  triangleIcon: string;
  eapLink: string;
  triggerStatusLabel: string;
}): object => {
  const icon = getInlineImage({ src: triangleIcon, size: 14 });

  const eventNameElement = getTextElement({
    attributes: { color },
    content: `${icon} <strong>${disasterTypeLabel}: ${eventName}</strong>`,
  });

  const contentContent = [];

  contentContent.push(
    firstTriggerLeadTimeString
      ? `<strong>${disasterTypeLabel}:</strong> expected to start on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`
      : `<strong>${disasterIssuedLabel}:</strong> expected on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`,
  );

  if (firstTriggerLeadTimeString) {
    contentContent.push(
      `<strong>${disasterIssuedLabel}:</strong> expected to reach threshold on ${firstTriggerLeadTimeString}, ${firstTriggerLeadTimeFromNow}`,
    );
  }

  contentContent.push(
    `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${nrOfTriggeredAreas} (see list below)`,
  ),
    contentContent.push(
      totalAffected
        ? `<strong>${indicatorLabel}:</strong> ${totalAffected} ${indicatorUnit}`
        : `The ${indicatorUnit} information is unavailable`,
    );

  contentContent.push(
    triggerStatusLabel === TriggerStatusLabelEnum.Trigger
      ? `<strong>Advisory:</strong> activate <a href="${eapLink}">Early Action Protocol</a>`
      : `<strong>Advisory:</strong> Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  );

  const contentElement = getTextElement({
    content: contentContent.join('<br>'),
  });

  const closingElement = getTextElement({
    content: `This ${triggerStatusLabel} was issued by IBF on ${issuedDate} (${timeZone})`,
    attributes: {
      'padding-top': '8px',
      'font-size': '14px',
    },
  });

  return getSectionElement({
    childrenEls: [eventNameElement, contentElement, closingElement],
  });
};

export const getMjmlEventListBody = (
  emailContent: ContentEventEmail,
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

        // EAP details
        triangleIcon: getTriangleIcon(
          event.eapAlertClass?.key,
          event.triggerStatusLabel,
        ),
        eapLink: emailContent.linkEapSop,

        disasterIssuedLabel: getDisasterIssuedLabel(
          event.eapAlertClass?.label,
          event.triggerStatusLabel,
        ),
        color: getIbfHexColor(
          event.eapAlertClass?.color,
          event.triggerStatusLabel,
        ),

        indicatorUnit: emailContent.indicatorMetadata.unit,
      }),
    );
  }
  return eventList;
};
