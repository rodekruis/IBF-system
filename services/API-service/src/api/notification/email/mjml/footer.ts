import { DASHBOARD_URL } from '../../../../config';
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

  return getSectionElement({ childrenEls: [twoColumnSectionElement] });
};

export const getLegalFooter = (): object => {
  const legalFooter = getTextElement({
    content: `
      <p>
        <a style="color: ${COLOR_WHITE}" href="${DASHBOARD_URL}/unsubscribe">
          Click here to unsubscribe
        </a>
        <br /><br />
        The Netherlands Red Cross - Anna van Saksenlaan 50 - The Hague, 2593 HT - Netherlands
      </p>
    `,
    attributes: { color: COLOR_WHITE, align: 'center', 'font-size': '12px' },
  });

  const legalColumn = {
    tagName: 'mj-column',
    children: [legalFooter],
    attributes: { padding: '0 8px', width: '100%' },
  };

  return getSectionElement({
    childrenEls: [legalColumn],
    attributes: { padding: '0', 'background-color': COLOR_BROWN },
  });
};
