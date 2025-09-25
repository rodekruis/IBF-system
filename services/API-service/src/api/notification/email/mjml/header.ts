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
  logos,
}: {
  disasterTypeLabel: string;
  eventCount: number;
  sentOnDate: string;
  logos: string[];
}) => {
  const logoElements = logos.map(
    (logo) =>
      `<img src="${getLogoUrl(logo)}" style="display: inline-block; height: 50px; width: auto; margin: auto; padding: 4px; background: ${COLOR_WHITE};" />`,
  );

  const logosElement = {
    tagName: 'mj-raw',
    content: `<div style="text-align: center;">${logoElements}</div>`,
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

const getLogoUrl = (logo: string) =>
  `${process.env.DASHBOARD_URL}/assets/logos/${logo}`;
