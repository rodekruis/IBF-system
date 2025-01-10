export enum FloodsScenario {
  Trigger = 'trigger',
  Warning = 'warning',
  WarningToTrigger = 'warning-to-trigger',
  NoTrigger = 'no-trigger',
}

export enum FlashFloodsScenario {
  Trigger = 'trigger',
  TriggerBlantyre = 'trigger-blantyre',
  WarningKaronga = 'warning-karonga',
  TriggerOngoingRumphi = 'trigger-ongoing-rumphi',
  NoTrigger = 'no-trigger',
}

export enum MalariaScenario {
  Trigger = 'trigger',
  NoTrigger = 'no-trigger',
}

export enum DroughtScenario {
  Trigger = 'trigger',
  NoTrigger = 'no-trigger',
}

export enum TyphoonScenario {
  NoEvent = 'noEvent',
  EventNoLandfall = 'eventNoLandfall',
  EventNoLandfallYet = 'eventNoLandfallYet',
  EventNoTrigger = 'eventNoTrigger',
  EventTrigger = 'eventTrigger',
  EventAfterLandfall = 'eventAfterLandfall',
}
