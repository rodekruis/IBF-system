import { getReturnElement, getTextElement } from '../../helpers/mjml.helper';

export const getMjmlHeader = ({
  disasterTypeLabel,
  nrOfEvents,
  sentOnDate,
  timeZone,
}: {
  disasterTypeLabel: string;
  nrOfEvents: number;
  sentOnDate: string;
  timeZone: string;
}): object => {
  const titleElement = getTextElement({
    content: `${nrOfEvents} ${disasterTypeLabel} alerts ${new Date().getTime()}`,
    attributes: {
      color: 'white',
      'font-size': '30px',
      'font-weight': 'bold',
      align: 'center',
    },
  });

  const subtitleElement = getTextElement({
    content: `IBF alert sent on ${sentOnDate} (${timeZone})`,
    attributes: {
      color: 'white',
      'font-size': '16px',
      'font-weight': 'bold',
      align: 'center',
    },
  });

  return getReturnElement({
    childrenEls: [titleElement, subtitleElement],
    attributes: {
      'background-color': '#4f22d7',
    },
  });
};
