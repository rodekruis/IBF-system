import { LeadTime } from '../../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../../../disaster-type/disaster-type.enum';
import { ContentEventEmail } from '../../dto/content-event-email.dto';
import {
  AlertStatusLabelEnum,
  NotificationDataPerEventDto,
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
  nrOfAlertAreas,
  timeZone,
  triangleIcon,
  eapLink,
  triggerStatusLabel,
  disasterSpecificCopy,
  forecastSource,
  userTriggerData,
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
  nrOfAlertAreas: number;
  timeZone: string;
  triangleIcon: string;
  eapLink: string;
  triggerStatusLabel: string;
  disasterSpecificCopy: string;
  forecastSource: { label: string; url: string };
  userTriggerData: { name: string; date: Date };
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
    if (triggerStatusLabel === AlertStatusLabelEnum.Trigger) {
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
    `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${nrOfAlertAreas} (see list below)`,
  );

  if (forecastSource) {
    contentContent.push(
      forecastSource.url
        ? `<strong>Forecast source:</strong> <a href="${forecastSource.url}">${forecastSource.label}</a>`
        : `<strong>Forecast source:</strong> ${forecastSource.label}`,
    );
  }

  if (userTriggerData) {
    contentContent.push(
      `<strong>Set by:</strong> ${userTriggerData.name} on ${dateObjectToDateTimeString(
        userTriggerData.date,
        'UTC',
      )}`,
    );
  }

  contentContent.push(
    triggerStatusLabel === AlertStatusLabelEnum.Trigger
      ? eapLink
        ? `<strong>Advisory:</strong> Activate <a href="${eapLink}">Protocol</a>` // Not all implemtations have an EAP, so for now defaulting to more generic copy
        : `<strong>Advisory:</strong> Activate Protocol`
      : `<strong>Advisory:</strong> Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  );

  const contentElement = getTextElement({
    content: contentContent.join('<br/>'),
  });

  const closingElement = getTextElement({
    content: `This ${triggerStatusLabel.toLowerCase()} was first issued by IBF on ${issuedDate} (${timeZone})`,
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
        event.triggerStatusLabel === AlertStatusLabelEnum.Trigger
          ? event.firstTriggerLeadTimeString
          : event.firstLeadTimeString
      }.`;
    } else if (event.disasterSpecificProperties.typhoonNoLandfallYet) {
      disasterSpecificCopy =
        'The landfall time prediction cannot be determined yet. Keep monitoring the event.';
    } else {
      disasterSpecificCopy = `Expected to reach the point closest to land on ${
        event.triggerStatusLabel === AlertStatusLabelEnum.Trigger
          ? event.firstTriggerLeadTimeString
          : event.firstLeadTimeString
      }. Not predicted to make landfall.`;
    }
  }
  if (event.triggerStatusLabel === AlertStatusLabelEnum.Warning) {
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

    const countryDisasterSettings =
      emailContent.country.countryDisasterSettings.find(
        (setting) => setting.disasterType === emailContent.disasterType,
      );

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
        nrOfAlertAreas: event.nrOfAlertAreas,
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
        forecastSource: event.event.userTrigger // Hide forecast source for "set" triggers
          ? null
          : (countryDisasterSettings.forecastSource as unknown as {
              label: string;
              url: string;
            }),
        userTriggerData: event.event.userTrigger // Hide forecast source for "set" triggers
          ? {
              name: event.event.userTriggerName,
              date: event.event.userTriggerDate,
            }
          : null,
        // Disaster-specific copy
        disasterSpecificCopy,
      }),
    );
  }
  return eventList;
};
