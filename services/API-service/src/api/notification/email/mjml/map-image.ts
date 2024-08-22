import { ContentEventEmail } from '../../dto/content-trigger-email.dto';
import {
  getImageElement,
  getMapImageDescription,
  getMapImgSrc,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

const getMjmlMapImage = ({
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

  return getSectionElement({
    childrenEls: [titleElement, descriptionElement, mapImageElement],
  });
};

export const getMjmlMapImages = (emailContent: ContentEventEmail): object[] => {
  const mapImages = [];
  for (const event of emailContent.dataPerEvent.filter(
    (event) => event.mapImage,
  )) {
    mapImages.push(
      getMjmlMapImage({
        src: getMapImgSrc(
          emailContent.country.countryCodeISO3,
          emailContent.disasterType,
          event.eventName,
        ),
        mapImgDescription: getMapImageDescription(emailContent.disasterType),
        eventName: event.eventName ? `(for ${event.eventName})` : '',
      }),
    );
  }
  return mapImages;
};
