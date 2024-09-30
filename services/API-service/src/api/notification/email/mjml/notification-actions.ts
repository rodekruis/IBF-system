import {
  getNotificationActionsSection,
  getSectionElement,
} from '../../helpers/mjml.helper';

export const getMjmlNotificationAction = ({
  linkDashboard,
  linkEapSop,
  socialMediaLink,
  socialMediaType,
}: {
  linkDashboard: string;
  linkEapSop: string;
  socialMediaLink: string;
  socialMediaType: string;
}): object => {
  const ibfPortalRow = getNotificationActionsSection({
    buttonText: 'Open IBF',
    buttonLink: linkDashboard,
    description:
      'Find more information about the potentially exposed areas, view the map and manage anticipatory actions.',
    primary: true,
  });

  const socialMediaRow = getNotificationActionsSection({
    buttonText: `Join ${socialMediaType}`,
    buttonLink: socialMediaLink,
    description: 'Communicate with relevant others about the trigger.',
    primary: false,
  });

  const aboutTriggerRow = getNotificationActionsSection({
    buttonText: `About Trigger`,
    buttonLink: linkEapSop,
    description:
      'Read about the trigger methodology and the anticipatory actions.',
    primary: false,
  });

  return getSectionElement({
    childrenEls: [ibfPortalRow, socialMediaRow, aboutTriggerRow],
  });
};
