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
