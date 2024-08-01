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
  const titleElement = {
    tagName: 'mj-text',
    attributes: { 'font-size': '36px', color: '#ffffff', align: 'center' },
    content: `${nrOfEvents} ${disasterTypeLabel} alerts`,
  };

  const subtitleElement = {
    tagName: 'mj-text',
    attributes: { 'font-size': '16px', color: '#ffffff', align: 'center' },
    content: `IBF alert sent on ${sentOnDate} (${timeZone})`,
  };

  return {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        attributes: {
          'background-color': '#4f22d7',
        },
        children: [titleElement, subtitleElement],
      },
    ],
  };
};
