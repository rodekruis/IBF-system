import { CreateNotificationInfoDto } from '../helpers/API-service/dto/create-notification-info.dto';

export const notificationInfoData: CreateNotificationInfoDto[] = [
  {
    countryCodeISO3: 'MWI',
    logo: {
      floods:
        'https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/31600ce7-b5e8-992f-8f53-e58f1b5dc955.png',
      'flash-floods':
        'https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/d628fa5d-f4fa-bc51-9977-d6b464ff003b.png',
    },
    triggerStatement: {
      floods:
        'An administrative area is triggered based on two parameters from the 6-days GloFAS forecast on a daily basis: the return period of the forecasted flood and the probability of occurrence. The trigger will activate when GloFAS issues a forecast of at least 60% probability of occurrence of a 5 year return period flood within the next 6 days. The GloFAS flood forecast triggers except in the Traditional Areas where the False Alarm Ratio (FAR) exceeds the predetermined maximum value which is 0.5.<br><br>Be aware that if a flood alert is issued with less than 6 days of lead time, the EAP may not be activated, please consider alternative response options.',
      'flash-floods':
        'A notification is issued when the model predicts that the rainfall forecasted can potentially lead to a flood, exposing at least 20 people. The trigger model updates every 6 hours based on rainfall forecasts. A <strong>warning</strong> notification will be issued based on the rainfall forecast, with a lead time of <strong>up to 48h</strong>. A <strong>trigger</strong> notification will be issued if the threshold is exceeded, with a lead time of <strong>12 hours or less</strong>.',
    },
    linkSocialMediaType: 'WhatsApp',
    linkSocialMediaUrl: 'https://chat.whatsapp.com/Kjh3qxURJOQImAgUUmbmbR/',
    linkVideo: 'https://bit.ly/IBF-video-Malawi',
    linkPdf:
      'https://510ibfsystem.blob.core.windows.net/manuals/IBF%20Manual-Malawi-Published.pdf',
    useWhatsapp: {
      'flash-floods': true,
      floods: false,
    },
    whatsappMessage: {
      'flash-floods': {
        'initial-single-event':
          "*IBF [triggerState] notification*\n\nA [triggerState] for flash floods is forecasted in *[eventName]* for: *[startTimeEvent]*.\n\nTo receive more detailed information reply 'yes' to this message.",
        'initial-multi-event':
          "*IBF notification*\n\nThere are *[nrEvents]* notifications issued for flash floods. The first notification is forecasted for: *[startTimeFirstEvent]*.\n\nTo receive more detailed information reply 'yes' to this message.",
        'follow-up':
          '*IBF [triggerState] notification*\n\nA [triggerState] for flash floods is forecasted in *[eventName]*: *[startTimeEvent]*.\n\nThere are *[nrAlertAreas]* [adminAreaLabel] listed below in order of potentially exposed population.\n[areaList]\nOpen the IBF Portal on a computer to get more information about this [triggerState].',
        'whatsapp-group':
          'Please use the designated WhatsApp group ([whatsappGroupLink]) to communicate about this trigger.',
        'no-trigger-old-event':
          'The trigger warning formerly activated on *[startDate]* is now below trigger threshold.\n\n',
        'no-trigger': 'There is *no trigger* currently.',
      },
    },
  },
];
