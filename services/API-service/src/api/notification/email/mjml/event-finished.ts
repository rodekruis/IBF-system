import { Event } from '../../../../shared/data.model';
import {
  getFormattedDate,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

const getMjmlFinishedEvent = ({
  disasterType,
  eventName,
  firstIssuedDate,
  timezone,
}: {
  disasterType: string;
  eventName: string;
  firstIssuedDate: Date;
  timezone: string;
}) => {
  const belowThresholdText = `<strong>${disasterType}: ${eventName} is now below threshold</strong>`;
  const portalText =
    'The events actions will continue to show on the IBF portal and can still be managed.';

  const eventEndedElement = getTextElement({
    content: `${belowThresholdText}<br/>${portalText}`,
  });

  const pleaseNoteElement = getTextElement({
    content:
      '<strong>Please note:</strong> The event will close when the forecast stays below threshold for 7 days in a row and will no longer show in the IBF portal',
  });

  const warningIssuedDate = getTextElement({
    content: `This warning was issued by the IBF portal on ${getFormattedDate({ date: firstIssuedDate })} (${timezone})`,
  });

  return getSectionElement({
    childrenEls: [eventEndedElement, pleaseNoteElement, warningIssuedDate],
    attributes: { padding: '8px' },
  });
};

export const getMjmlFinishedEvents = ({
  disasterType,
  events,
  timezone,
}: {
  disasterType: string;
  events: Event[];
  timezone: string;
}) => {
  return events.map(({ eventName, firstIssuedDate }) =>
    getMjmlFinishedEvent({
      disasterType,
      eventName,
      firstIssuedDate,
      timezone,
    }),
  );
};
