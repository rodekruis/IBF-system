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
  const ibfPortalRow = getNotificationActionsSection(
    'Go to the IBF-portal',
    linkDashboard,
    'Find more information about the potentially exposed areas, view the map and manage anticipatory actions.',
  );

  const socialMediaRow = getNotificationActionsSection(
    `Join ${socialMediaType} group`,
    socialMediaLink,
    'Communicate with relevant others about the trigger.',
  );

  const aboutTriggerRow = getNotificationActionsSection(
    `About Trigger`,
    linkEapSop,
    'Read about the trigger methodology and the anticipatory actions.',
  );

  return getReturnElement({
    childrenEls: [ibfPortalRow, socialMediaRow, aboutTriggerRow],
  });
};
