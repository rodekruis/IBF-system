export const getReturnElement = ({
  childrenEls,
  attributes,
}: {
  childrenEls: object[];
  attributes?: object;
}) => {
  return {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        children: childrenEls,
      },
    ],
    attributes,
  };
};

export const getTextElement = ({
  content,
  attributes,
}: {
  content: string;
  attributes?: object;
}): { tagName: string; content: string; attributes?: object } => {
  return {
    tagName: 'mj-text',
    content,
    attributes,
  };
};

export const getNotificationActionsSection = (
  buttonText: string,
  buttonLink: string,
  descriptionn: string,
): object => {
  return {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        children: [
          {
            tagName: 'mj-button',
            attributes: { href: buttonLink },
            content: buttonText,
          },
        ],
      },
      {
        tagName: 'mj-column',
        children: [getTextElement({ content: descriptionn })],
      },
    ],
  };
};

export const getAdminAreaTable = ({
  indicatorLabel,
  adminAreaLabel,
  adminAreaParentLabel,
  adminAreaList,
  isTrigger,
}: {
  indicatorLabel: string;
  adminAreaLabel: string;
  adminAreaParentLabel: string;
  adminAreaList: { exposed?: number; name: string }[];
  isTrigger: boolean;
}) => {
  const header = `
    <tr>
      ${isTrigger ? '<th>Exposed ' + indicatorLabel + '</th>' : ''}
      <th>${adminAreaLabel} (${adminAreaParentLabel})</th>
    </tr>
  `;

  const row = (adminArea) => `
    <tr>
      ${isTrigger ? '<td>' + adminArea.exposed + '</td>' : ''}
      <td>${adminArea.name}</td>
    </tr>
  `;
  const rows = adminAreaList.map((adminArea) => row(adminArea)).join('');

  const tbody = `${header}${rows}`;

  return {
    tagName: 'mj-table',
    content: tbody,
  };
};

export const getInlineTriangleIcon = ({ src }: { src: string }): string =>
  `<img src="${src}" style="width: 14px; padding-right: 4px"></img>`;
