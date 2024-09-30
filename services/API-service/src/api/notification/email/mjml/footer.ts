import {
  COLOR_BROWN,
  COLOR_WHITE,
  getImageElement,
  getLogoImageAsDataURL,
  getSectionElement,
  getTextElement,
} from '../../helpers/mjml.helper';

export const getIbfFooter = ({
  countryName,
}: {
  countryName: string;
}): object => {
  const logoElement = getImageElement({
    src: getLogoImageAsDataURL(),
    attributes: { width: '45px', height: '45px' },
  });

  const textElement = getTextElement({
    content: `Impact-Based Forecasting Portal (IBF) was co-developed by Netherlands
    Red Cross 510 the together with the ${countryName} Red Cross
    National Society. For questions contact us at <a href="mailto:ibf-support@510.global">ibf-support@510.global</a>`,
    attributes: { 'padding-top': '8px', 'font-size': '12px' },
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
    attributes: { padding: '0 8px' },
  };

  return getSectionElement({
    childrenEls: [twoColumnSectionElement],
  });
};

export const getMailchimpFooter = (): object => {
  const mailchimpFooter = getTextElement({
    content: `
      <p>
        <a style="color: ${COLOR_WHITE}" href="*|UNSUB|*">
          Click here to unsubscribe from IBF alerts
        </a>
        &nbsp;
        *|LIST:ADDRESSLINE|*
      </p>
      <p style="margin: 0">*|IF:REWARDS|* *|HTML:REWARDS|* *|END:IF|*</p>
    `,
    attributes: {
      color: COLOR_WHITE,
      align: 'center',
      'font-size': '12px',
    },
  });

  const mailchimpColumn = {
    tagName: 'mj-column',
    children: [mailchimpFooter],
    attributes: {
      padding: '0 8px',
      width: '100%',
    },
  };

  return getSectionElement({
    childrenEls: [mailchimpColumn],
    attributes: { padding: '0', 'background-color': COLOR_BROWN },
  });
};
