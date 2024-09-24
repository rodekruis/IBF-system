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
  const logosElement = getImageElement({
    src: logosSrc,
    otherAttributes: {
      padding: '0px',
      'container-background-color': COLOR_WHITE,
    },
  });

  const titleElement = getTextElement({
    content: `${nrOfEvents} ${disasterTypeLabel} alerts`,
  };

  const subtitleElement = {
    tagName: 'mj-text',
    attributes: { 'font-size': '16px', color: '#ffffff', align: 'center' },
    content: `IBF alert sent on ${sentOnDate} (${timeZone})`,
  };

  return {
    tagName: 'mj-column',
    attributes: {
      'padding-top': '16px',
      'background-color': COLOR_PRIMARY,
    },
    children: [titleElement, subtitleElement],
  };
};
