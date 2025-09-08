import { DisasterSpecificProperties } from '../../../../shared/data.model';
import { firstCharOfWordsToUpper } from '../../../../shared/utils';
import { LeadTime } from '../../../admin-area-dynamic-data/enum/lead-time.enum';
import { ForecastSource } from '../../../country/country-disaster.entity';
import { DisasterType } from '../../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../../event/dto/last-upload-date.dto';
import {
  ALERT_LEVEL_COLOUR,
  ALERT_LEVEL_LABEL,
  ALERT_LEVEL_WARNINGS,
  AlertLevel,
} from '../../../event/enum/alert-level.enum';
import { ContentEventEmail } from '../../dto/content-event-email.dto';
import {
  dateObjectToDateTimeString,
  getInlineImage,
  getSectionElement,
  getTextElement,
  getTimeFromNow,
  getTimezoneDisplay,
  getTriangleIcon,
} from '../../helpers/mjml.helper';

const getMjmlBodyEvent = ({
  textColour,
  defaultAdminAreaLabel,
  disasterIssuedLabel,
  disasterTypeLabel,
  enableSetWarningToTrigger,
  eventName,
  firstLeadTimeFromNow,
  firstLeadTimeString,
  firstTriggerLeadTimeFromNow,
  firstTriggerLeadTimeString,
  issuedDate,
  alertAreaCount,
  timeZone,
  triangleIcon,
  eapLink,
  alertLevel,
  disasterSpecificCopy,
  forecastSource,
  userTriggerData,
}: {
  textColour: string;
  defaultAdminAreaLabel: string;
  disasterIssuedLabel: string;
  disasterTypeLabel: string;
  enableSetWarningToTrigger: boolean;
  eventName: string;
  firstLeadTimeFromNow: string;
  firstLeadTimeString: string;
  firstTriggerLeadTimeFromNow: string;
  firstTriggerLeadTimeString: string;
  issuedDate: string;
  alertAreaCount: number;
  timeZone: string;
  triangleIcon: string;
  eapLink: string;
  alertLevel: AlertLevel;
  disasterSpecificCopy: string;
  forecastSource: ForecastSource;
  userTriggerData: { name: string; date: Date };
}): object => {
  const icon = getInlineImage({ src: triangleIcon, size: 16 });

  const eventNameElement = getTextElement({
    attributes: { color: textColour },
    content: `${icon} <strong data-testid="event-name">${ALERT_LEVEL_LABEL[alertLevel]}: ${eventName}</strong>`,
  });

  const contentContent = [];

  if (disasterSpecificCopy) {
    contentContent.push(
      `<strong>${disasterIssuedLabel}:</strong> ${disasterSpecificCopy}`,
    );
  } else {
    if (alertLevel === AlertLevel.TRIGGER) {
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
    `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${alertAreaCount} (see list below)`,
  );

  if (userTriggerData) {
    contentContent.push(
      `<strong>Set by:</strong> ${userTriggerData.name} on ${dateObjectToDateTimeString(
        userTriggerData.date,
        'UTC',
      )}`,
    );
  } else if (forecastSource) {
    contentContent.push(
      forecastSource.url
        ? `<strong>Forecast source:</strong> <a href="${forecastSource.url}">${forecastSource.label}</a>`
        : `<strong>Forecast source:</strong> ${forecastSource.label}`,
    );
  }

  contentContent.push(
    alertLevel === AlertLevel.TRIGGER
      ? eapLink
        ? `<strong>Advisory:</strong> Activate <a href="${eapLink}">Protocol</a>` // Not all implemtations have an EAP, so for now defaulting to more generic copy
        : `<strong>Advisory:</strong> Activate Protocol`
      : enableSetWarningToTrigger
        ? `<strong>Advisory:</strong> An IBF focal point user can set this warning as a trigger${forecastSource?.setTriggerSource ? ` based on ${forecastSource.setTriggerSource}` : ''}.`
        : `<strong>Advisory:</strong> Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  );

  const contentElement = getTextElement({
    content: contentContent.join('<br/>'),
  });

  const alertTypeLabel = ALERT_LEVEL_WARNINGS.includes(alertLevel)
    ? 'warning'
    : 'trigger';

  const closingElement = getTextElement({
    content: `This ${alertTypeLabel} was first issued by IBF on ${issuedDate} (${timeZone})`,
    attributes: { 'padding-top': '8px', 'font-size': '14px' },
  });

  return getSectionElement({
    childrenEls: [eventNameElement, contentElement, closingElement],
    attributes: { padding: '8px' },
  });
};

const getTyphoonSpecificCopy = (
  firstLeadTime: LeadTime,
  disasterSpecificProperties: DisasterSpecificProperties,
  alertLevel: AlertLevel,
  leadTimeString: string,
) => {
  let disasterSpecificCopy: string;
  if (firstLeadTime === LeadTime.hour0) {
    if (disasterSpecificProperties.typhoonLandfall) {
      disasterSpecificCopy = 'Has already made landfall.';
    } else {
      disasterSpecificCopy =
        'Has already reached the point closest to land. Not predicted to make landfall.';
    }
  } else {
    if (disasterSpecificProperties.typhoonLandfall) {
      disasterSpecificCopy = `Expected to make landfall on ${leadTimeString}.`;
    } else if (disasterSpecificProperties.typhoonNoLandfallYet) {
      disasterSpecificCopy =
        'The landfall time prediction cannot be determined yet. Keep monitoring the event.';
    } else {
      disasterSpecificCopy = `Expected to reach the point closest to land on ${
        leadTimeString
      }. Not predicted to make landfall.`;
    }
  }
  if (ALERT_LEVEL_WARNINGS.includes(alertLevel)) {
    disasterSpecificCopy += ' Not predicted to reach trigger thresholds.';
  }
  return disasterSpecificCopy;
};

export const getMjmlEventListBody = async (
  {
    events,
    disasterType: {
      disasterType,
      label: disasterTypeLabel,
      enableSetWarningToTrigger,
    },
    country: { countryDisasterSettings },
    defaultAdminAreaLabel,
    eapLink,
    lastUploadDate,
  }: ContentEventEmail,
  getEventTimeString: (
    leadTime: LeadTime,
    countryCodeISO3: string,
    lastUploadDate?: LastUploadDateDto,
    date?: Date,
  ) => Promise<string>,
) => {
  const eventList = [];

  for (const {
    firstLeadTime,
    firstTriggerLeadTime,
    firstIssuedDate,
    countryCodeISO3,
    alertLevel,
    disasterSpecificProperties,
    userTrigger,
    userTriggerName,
    userTriggerDate,
    eventName,
    alertAreas,
  } of events) {
    const firstLeadTimeString = await getEventTimeString(
      firstLeadTime,
      countryCodeISO3,
      lastUploadDate,
    );

    const firstTriggerLeadTimeString = firstTriggerLeadTime
      ? await getEventTimeString(
          firstTriggerLeadTime,
          countryCodeISO3,
          lastUploadDate,
        )
      : null;

    const leadTimeString =
      alertLevel === AlertLevel.TRIGGER
        ? firstTriggerLeadTimeString
        : firstLeadTimeString;

    let disasterSpecificCopy: string;
    if (disasterType === DisasterType.Typhoon) {
      disasterSpecificCopy = getTyphoonSpecificCopy(
        firstLeadTime,
        disasterSpecificProperties,
        alertLevel,
        leadTimeString,
      );
    }

    const countryDisasterSetting = countryDisasterSettings.find(
      (countryDisasterSettings) =>
        countryDisasterSettings.disasterType === disasterType,
    );

    const userTriggerData = { name: userTriggerName, date: userTriggerDate };

    eventList.push(
      getMjmlBodyEvent({
        eventName,

        disasterTypeLabel: firstCharOfWordsToUpper(disasterTypeLabel),
        enableSetWarningToTrigger,
        alertLevel,
        issuedDate: dateObjectToDateTimeString(
          firstIssuedDate,
          countryCodeISO3,
        ),
        timeZone: getTimezoneDisplay(countryCodeISO3),

        // Lead time details
        firstLeadTimeString,
        firstTriggerLeadTimeString,
        firstLeadTimeFromNow: getTimeFromNow(firstLeadTime),
        firstTriggerLeadTimeFromNow: getTimeFromNow(firstTriggerLeadTime),

        // Area details
        alertAreaCount: alertAreas.length,
        defaultAdminAreaLabel: defaultAdminAreaLabel.plural.toLocaleLowerCase(),

        // EAP details
        triangleIcon: getTriangleIcon(alertLevel),
        eapLink,

        disasterIssuedLabel: ALERT_LEVEL_LABEL[alertLevel],
        textColour: ALERT_LEVEL_COLOUR[alertLevel],
        forecastSource: countryDisasterSetting.forecastSource,
        userTriggerData: userTrigger // Hide forecast source for "set" triggers
          ? userTriggerData
          : null,
        // Disaster-specific copy
        disasterSpecificCopy,
      }),
    );
  }
  return eventList;
};
