export const WIDTH_BODY = '632px';
export const WIDTH_INNER_BODY = '437px';

export const COLOR_PRIMARY = '#4f22d7';
export const COLOR_SECONDARY = '#ffffff';
export const COLOR_TERTIARY = '#cfbfff';
export const COLOR_WHITE = '#ffffff';

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
    attributes: {
      width: WIDTH_INNER_BODY,
      padding: '0px 0px 20px 0px',
      ...attributes,
    },
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
    attributes: {
      'line-height': '1.5',
      padding: '0px',
      'font-size': '14px',
      ...attributes,
    },
  };
};

export const getNotificationActionsSection = ({
  buttonText,
  buttonLink,
  description,
  primary,
}: {
  buttonText: string;
  buttonLink: string;
  description: string;
  primary: boolean;
}): object => {
  return {
    tagName: 'mj-section',
    attributes: { padding: '0px 0px 10px 0px' },
    children: [
      {
        tagName: 'mj-column',
        attributes: {
          'vertical-align': 'middle',
          width: '200px',
        },
        children: [
          {
            tagName: 'mj-button',
            attributes: {
              href: buttonLink,
              align: 'left',
              width: '200px',
              height: '28px',
              'border-radius': '24px',
              padding: '0px',
              'background-color': primary ? COLOR_PRIMARY : COLOR_SECONDARY,
              color: primary ? COLOR_SECONDARY : COLOR_PRIMARY,
              border: `1px solid ${primary ? COLOR_PRIMARY : COLOR_TERTIARY}`,
              'font-weight': 'bold',
            },
            content: buttonText,
          },
        ],
      },
      {
        tagName: 'mj-column',
        attributes: {
          'vertical-align': 'middle',
          width: '250px',
        },
        children: [
          getTextElement({
            content: description,
            attributes: { 'padding-left': '10px' },
          }),
        ],
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
  const align = isTrigger ? 'left' : 'center';

  const header = `
    <tr align="${align}">
      ${isTrigger ? '<th>Exposed ' + indicatorLabel + '</th>' : ''}
      <th>${adminAreaLabel} (${adminAreaParentLabel})</th>
    </tr>
  `;

  const row = (adminArea) => `
    <tr align="${align}">
      ${isTrigger ? '<td>' + adminArea.exposed + '</td>' : ''}
      <td>${adminArea.name}</td>
    </tr>
  `;
  const rows = adminAreaList.map((adminArea) => row(adminArea)).join('');

  const tbody = `${header}${rows}`;

  return {
    tagName: 'mj-table',
    content: tbody,
    attributes: { 'container-background-color': COLOR_WHITE },
  };
};

export const getInlineImage = ({
  src,
  size,
}: {
  src: string;
  size: number;
}): string =>
  `<img src="${src}" width="${size}" height="${size}" style="display: inline-block; width: ${size}px; height: ${size}px; max-width: ${size}px; max-height: ${size}px"></img>`;

export const getImageElement = ({
  src,
  otherAttributes,
}: {
  src: string;
  otherAttributes?: object;
}): object => {
  return {
    tagName: 'mj-image',
    attributes: { src, ...otherAttributes },
  };
};
