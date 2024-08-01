import { TriggerStatusLabelEnum } from '../../dto/notification-date-per-event.dto';

export const getMjmlBodyEvent = ({
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
  triggerStatusLabel: string;
}): object => {
  console.log('🚀 ~ triangleIcon:', triangleIcon);
  const eventNameElement = {
    tagName: 'mj-text',
    attributes: { color },
    content: `${disasterTypeLabel}: ${eventName}`,
  };

  const triggerOrWarningElement = {
    tagName: 'mj-text',
    content: firstTriggerLeadTimeString
      ? `${disasterTypeLabel} expected to start on ${firstLeadTimeString} ${firstLeadTimeFromNow}s from now. ${disasterIssuedLabel}: expected to reach threshold on ${firstTriggerLeadTimeString}, ${firstTriggerLeadTimeFromNow}s from now`
      : `${disasterIssuedLabel}: expected on ${firstLeadTimeString}, ${firstLeadTimeFromNow}s from now.`,
  };

  const exposedAdminAreasElement = {
    tagName: 'mj-text',
    content: `Expected exposed ${defaultAdminAreaLabel}: ${nrOfTriggeredAreas} (see list below)`,
  };

  const indicatorElement = {
    tagName: 'mj-text',
    content: totalAffected
      ? `${indicatorLabel}: ${totalAffected} ${indicatorUnit}`
      : `The ${indicatorUnit} information is unavailable`,
  };

  const advisoryElement = {
    tagName: 'mj-text',
    content:
      triggerStatusLabel === TriggerStatusLabelEnum.Trigger
        ? `Advisory: activate Early Action Protocol`
        : `Advisory: Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  };

  const triggerStatusIssueDateElement = {
    tagName: 'mj-text',
    content: `This ${triggerStatusLabel} was issued by IBF on ${issuedDate} (${timeZone})`,
  };

  return {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        children: [
          eventNameElement,
          triggerOrWarningElement,
          exposedAdminAreasElement,
          indicatorElement,
          advisoryElement,
          triggerStatusIssueDateElement,
        ],
      },
    ],
  };
};
