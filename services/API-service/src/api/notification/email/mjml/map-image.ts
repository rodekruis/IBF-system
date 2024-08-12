import {
  getImageElement,
  getReturnElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlMapImage = ({
  eventName,
  mapImgDescription,
  src,
}: {
  eventName: string;
  mapImgDescription: string;
  src: string;
}): object => {
  const titleElement = getTextElement({
    content: `Map of the triggered area ${eventName}`,
  });

  const descriptionElement = getTextElement({
    content: `${mapImgDescription}`,
  });

  const mapImageElement = getImageElement({
    src,
    otherAttributes: { width: '600px' },
  });

  return getReturnElement({
    childrenEls: [titleElement, descriptionElement, mapImageElement],
  });
};
