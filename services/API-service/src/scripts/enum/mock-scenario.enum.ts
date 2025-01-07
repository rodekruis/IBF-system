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

// Refactor, can we use a base enum of Trigger/NoTrigger, that is extended by the disaster-specific enums?
export enum DroughtSenario {
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
