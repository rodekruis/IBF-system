import { TriggerStatusLabelEnum } from '../../dto/notification-date-per-event.dto';
import {
  getInlineTriangleIcon,
  getReturnElement,
  getTextElement,
} from '../../helpers/mjml.helper';

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
  const icon = getInlineTriangleIcon({ src: triangleIcon });

  const eventNameElement = getTextElement({
    attributes: { color },
    content: `${icon} <strong>${disasterTypeLabel}: ${eventName}</strong>`,
  });

  const triggerOrWarningElement = getTextElement({
    content: firstTriggerLeadTimeString
      ? `<strong>${disasterTypeLabel}:</strong> expected to start on ${firstLeadTimeString} ${firstLeadTimeFromNow}s from now.<br>
        <strong>${disasterIssuedLabel}:</strong> expected to reach threshold on ${firstTriggerLeadTimeString}, ${firstTriggerLeadTimeFromNow}s from now`
      : `<strong>${disasterIssuedLabel}:</strong> expected on ${firstLeadTimeString}, ${firstLeadTimeFromNow}s from now.`,
  });

  const exposedAdminAreasElement = getTextElement({
    content: `<strong>Expected exposed ${defaultAdminAreaLabel}:</strong> ${nrOfTriggeredAreas} (see list below)`,
  });

  const indicatorElement = getTextElement({
    content: totalAffected
      ? `<strong>${indicatorLabel}:</strong> ${totalAffected} ${indicatorUnit}`
      : `The ${indicatorUnit} information is unavailable`,
  });

  const advisoryElement = getTextElement({
    content:
      triggerStatusLabel === TriggerStatusLabelEnum.Trigger
        ? `<strong>Advisory:</strong> activate Early Action Protocol`
        : `<strong>Advisory:</strong> Inform all potentialy exposed ${defaultAdminAreaLabel}`,
  });

  const triggerStatusIssueDateElement = getTextElement({
    content: `This ${triggerStatusLabel} was issued by IBF on ${issuedDate} (${timeZone})`,
  });

  return getReturnElement({
    childrenEls: [
      eventNameElement,
      triggerOrWarningElement,
      exposedAdminAreasElement,
      indicatorElement,
      advisoryElement,
      triggerStatusIssueDateElement,
    ],
  });
};
