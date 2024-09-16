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
      <div style="background-color: #241C15; color: #ffffff; text-align: center">
      <p><a style="color: #ffffff" href="*|UNSUB|*">Click here to usbubscribe from IBF alerts</a> *|LIST:ADDRESSLINE|*
      </p>
      <p>*|IF:REWARDS|* *|HTML:REWARDS|* *|END:IF|*</p>
      </div>`,
  });

  return getSectionElement({
    childrenEls: [twoColumnSectionElement, mailchimpFooter],
  });
};
