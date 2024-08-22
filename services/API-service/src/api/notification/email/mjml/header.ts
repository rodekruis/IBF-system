import {
  COLOR_PRIMARY,
  COLOR_WHITE,
  getImageElement,
  getReturnElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlHeader = ({
  disasterTypeLabel,
  nrOfEvents,
  sentOnDate,
  timeZone,
  logosSrc,
}: {
  disasterTypeLabel: string;
  nrOfEvents: number;
  sentOnDate: string;
  timeZone: string;
  logosSrc: string;
}): object => {
  const logosElement = getImageElement({
    src: logosSrc,
  });

  const titleElement = getTextElement({
    content: `${nrOfEvents} ${disasterTypeLabel} alerts`,
    attributes: {
      color: COLOR_WHITE,
      'font-size': '30px',
      'font-weight': 'bold',
      align: 'center',
    },
  });

  const subtitleElement = getTextElement({
    content: `IBF alert sent on ${sentOnDate} (${timeZone})`,
    attributes: {
      color: COLOR_WHITE,
      'font-size': '16px',
      'font-weight': 'bold',
      align: 'center',
    },
  });

  return getReturnElement({
    childrenEls: [logosElement, titleElement, subtitleElement],
    attributes: {
      'background-color': COLOR_PRIMARY,
    },
  });
};
