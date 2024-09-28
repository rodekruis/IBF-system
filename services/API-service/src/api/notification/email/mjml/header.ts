import {
  COLOR_PRIMARY,
  COLOR_WHITE,
  getImageElement,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlHeader = ({
  disasterTypeLabel,
  nrOfEvents,
  sentOnDate,
  logosSrc,
}: {
  disasterTypeLabel: string;
  nrOfEvents: number;
  sentOnDate: string;
  logosSrc: string;
}): object => {
  const logosElement = getImageElement({
    src: logosSrc,
    attributes: {
      padding: '0',
      'container-background-color': COLOR_WHITE,
    },
  });

  const titleElement = getTextElement({
    content: `${nrOfEvents} ${disasterTypeLabel} alerts`,
    attributes: {
      color: COLOR_WHITE,
      'font-size': '28px',
      'font-weight': 'bold',
      'padding-top': '14px',
      align: 'center',
    },
  });

  const subtitleElement = getTextElement({
    content: `IBF alert sent on ${sentOnDate}`,
    attributes: {
      color: COLOR_WHITE,
      'font-weight': 'bold',
      align: 'center',
    },
  });

  return getSectionElement({
    childrenEls: [logosElement, titleElement, subtitleElement],
    attributes: {
      'padding-top': '16px',
      'background-color': COLOR_PRIMARY,
    },
  });
};
