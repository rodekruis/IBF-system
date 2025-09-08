import {
  COLOR_PRIMARY,
  COLOR_WHITE,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlHeader = ({
  disasterTypeLabel,
  eventCount,
  sentOnDate,
  logosSrc,
}: {
  disasterTypeLabel: string;
  eventCount: number;
  sentOnDate: string;
  logosSrc: string;
}): object => {
  const logosElement = {
    tagName: 'mj-raw',
    content: `<div style="text-align: center;"><img src="${logosSrc}" style="display: block; height: 50px; width: auto; margin: auto; background: ${COLOR_WHITE};" /></div>`,
  };

  const titleElement = getTextElement({
    content: `${eventCount} ${disasterTypeLabel} alerts`,
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
    attributes: { color: COLOR_WHITE, align: 'center' },
  });

  return getSectionElement({
    childrenEls: [logosElement, titleElement, subtitleElement],
    attributes: { 'background-color': COLOR_PRIMARY },
  });
};
