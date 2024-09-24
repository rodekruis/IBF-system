import {
  getImageElement,
  getLogoImageAsDataURL,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getMjmlFooter = ({
  countryName,
}: {
  countryName: string;
}): object => {
  const logoElement = getImageElement({
    src: getLogoImageAsDataURL(),
    otherAttributes: { width: '45px', height: '45px' },
  });

  const textElement = getTextElement({
    content: `Impact-Based Forecasting Portal (IBF) was co-developed by Netherlands
    Red Cross 510 the together with the ${countryName} Red Cross
    National Society. For questions contact us at ibf-support@510.global`,
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

  const mailchimpFooter = getTextElement({
    content: `
      <p>
        <a style="color: #ffffff" href="*|UNSUB|*">
          Click here to unsubscribe from IBF alerts
        </a>
      </p>
      <p>*|LIST:ADDRESSLINE|*</p>
      <p>*|IF:REWARDS|* *|HTML:REWARDS|* *|END:IF|*</p>
    `,
    attributes: {
      color: '#ffffff',
      align: 'center',
    },
  });

  const mailchimpColumn = {
    tagName: 'mj-column',
    children: [mailchimpFooter],
    attributes: {
      padding: '4px',
      'background-color': '#241C15',
      width: '100%',
    },
  };

  return getSectionElement({
    childrenEls: [twoColumnSectionElement, mailchimpColumn],
  });
};
