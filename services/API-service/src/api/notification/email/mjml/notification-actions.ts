import {
  getNotificationActionsSection,
  getReturnElement,
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
    buttonText: 'Go to the IBF-portal',
    buttonLink: linkDashboard,
    description:
      'Find more information about the potentially exposed areas, view the map and manage anticipatory actions.',
    primary: true,
  });

  const socialMediaRow = getNotificationActionsSection({
    buttonText: `${socialMediaType} group`,
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

  return getReturnElement({
    childrenEls: [ibfPortalRow, socialMediaRow, aboutTriggerRow],
  });
};
