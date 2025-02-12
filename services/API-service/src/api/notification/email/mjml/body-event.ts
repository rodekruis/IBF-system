import { LeadTime } from '../../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../../../disaster-type/disaster-type.enum';
import { ContentEventEmail } from '../../dto/content-trigger-email.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../../dto/notification-date-per-event.dto';
import {
  dateObjectToDateTimeString,
  getDisasterIssuedLabel,
  getIbfHexColor,
  getInlineImage,
  getSectionElement,
  getTextElement,
  getTimeFromNow,
  getTimezoneDisplay,
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
  issuedDate,
  nrOfTriggeredAreas,
  timeZone,
  triangleIcon,
  eapLink,
  triggerStatusLabel,
  disasterSpecificCopy,
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
  issuedDate: string;
  nrOfTriggeredAreas: number;
  timeZone: string;
  triangleIcon: string;
  eapLink: string;
  triggerStatusLabel: string;
  disasterSpecificCopy: string;
}): object => {
  const icon = getInlineImage({ src: triangleIcon, size: 16 });

  const eventNameElement = getTextElement({
    attributes: { color },
    content: `${icon} <strong data-testid="event-name">${disasterTypeLabel}: ${eventName}</strong>`,
  });

  const contentContent = [];

  if (disasterSpecificCopy) {
    contentContent.push(
      `<strong>${disasterIssuedLabel}:</strong> ${disasterSpecificCopy}`,
    );
  } else {
    if (triggerStatusLabel === TriggerStatusLabelEnum.Trigger) {
      // Trigger event
      if (firstLeadTimeString !== firstTriggerLeadTimeString) {
        // Warning-to-trigger event: show start of warning first
        contentContent.push(
          `<strong>${disasterTypeLabel}:</strong> Expected to start on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`,
        );
      }
      // Either way, show start of trigger next, the above line is optionally extra
      contentContent.push(
        `<strong>${disasterIssuedLabel}:</strong> Expected to start on ${firstTriggerLeadTimeString}, ${firstTriggerLeadTimeFromNow}.`,
      );
    } else {
      // Warning event
      contentContent.push(
        `<strong>${disasterIssuedLabel}:</strong> Expected to start on ${firstLeadTimeString}, ${firstLeadTimeFromNow}.`,
      );
    }
  }

  contentContent.push(
    `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${nrOfTriggeredAreas} (see list below)`,
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
    content: `This ${triggerStatusLabel.toLowerCase()} was first issued by IBF on ${issuedDate} (${timeZone})`,
    attributes: { 'padding-top': '8px', 'font-size': '14px' },
  });

  return getSectionElement({
    childrenEls: [eventNameElement, contentElement, closingElement],
    attributes: { padding: '8px' },
  });
};

const getTyphoonSpecificCopy = (event: NotificationDataPerEventDto): string => {
  let disasterSpecificCopy: string;
  if (event.firstLeadTime === LeadTime.hour0) {
    if (event.disasterSpecificProperties.typhoonLandfall) {
      disasterSpecificCopy = 'Has already made landfall.';
    } else {
      disasterSpecificCopy =
        'Has already reached the point closest to land. Not predicted to make landfall.';
    }
  } else {
    if (event.disasterSpecificProperties.typhoonLandfall) {
      disasterSpecificCopy = `Expected to make landfall on ${
        event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger
          ? event.firstTriggerLeadTimeString
          : event.firstLeadTimeString
      }.`;
    } else if (event.disasterSpecificProperties.typhoonNoLandfallYet) {
      disasterSpecificCopy =
        'The landfall time prediction cannot be determined yet. Keep monitoring the event.';
    } else {
      disasterSpecificCopy = `Expected to reach the point closest to land on ${
        event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger
          ? event.firstTriggerLeadTimeString
          : event.firstLeadTimeString
      }. Not predicted to make landfall.`;
    }
  }
  if (event.triggerStatusLabel === TriggerStatusLabelEnum.Warning) {
    disasterSpecificCopy += ' Not predicted to reach trigger thresholds.';
  }
  return disasterSpecificCopy;
};

export const getMjmlEventListBody = (emailContent: ContentEventEmail) => {
  const eventList = [];

  for (const event of emailContent.dataPerEvent) {
    let disasterSpecificCopy: string;
    if (emailContent.disasterType === DisasterType.Typhoon) {
      disasterSpecificCopy = getTyphoonSpecificCopy(event);
    }

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

        // Disaster-specific copy
        disasterSpecificCopy,
      }),
    );
  }
  return eventList;
};
