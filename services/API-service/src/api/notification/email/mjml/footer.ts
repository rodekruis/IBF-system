import {
  COLOR_PRIMARY,
  COLOR_WHITE,
  getImageElement,
  getReturnElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlFooter = ({
  ibfLogo,
  countryName,
}: {
  ibfLogo: string;
  countryName: string;
}): object => {
  const logoElement = getImageElement({
    src: ibfLogo,
    otherAttributes: { width: '45px' },
  });

  const textElement = getTextElement({
    content: `Impact-Based Forecasting Portal (IBF) was co-developed by Netherlands
    Red Cross 510 the together with the ${countryName} Red Cross
    National Society. For questions contact us at ibf-support@510.global`,
    attributes: { color: COLOR_WHITE },
  });

  const twoColumnSectionElement = {
    tagName: 'mj-section',
    children: [
      {
        tagName: 'mj-column',
        children: [logoElement],
        attributes: { width: '20%' },
      },
      {
        tagName: 'mj-column',
        children: [textElement],
        attributes: { width: '80%' },
      },
    ],
  };
  return getReturnElement({
    childrenEls: [twoColumnSectionElement],
    attributes: { 'background-color': COLOR_PRIMARY },
  });
};
