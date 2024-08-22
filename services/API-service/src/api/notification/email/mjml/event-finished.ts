import { getSectionElement, getTextElement } from '../../helpers/mjml.helper';

export const getMjmlEventFinished = ({
  disasterTypeLabel,
  eventName,
  issuedDate,
  timezone,
}: {
  disasterTypeLabel: string;
  eventName: string;
  issuedDate: Date;
  timezone: string;
}): object => {
  const belowThresholdText = `<strong>${disasterTypeLabel}: ${eventName} is now below threshold</strong>`;
  const portalText =
    'The events actions will continue to show on the IBF portal and can still be managed.';

  const eventEndedElement = getTextElement({
    content: `${belowThresholdText}<br>${portalText}`,
  });

  const pleaseNoteElement = getTextElement({
    content:
      '<strong>Please note:</strong> The event will close when the forecast stays below threshold for 7 days in a row and will no longer show in the IBF portal',
  });

  const warningIssuedDate = getTextElement({
    content: `This warning was issued by the IBF portal on ${issuedDate} (${timezone})`,
  });

  return getSectionElement({
    childrenEls: [eventEndedElement, pleaseNoteElement, warningIssuedDate],
  });
};
