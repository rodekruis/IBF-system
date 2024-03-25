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
  // Implemented in new mock
  NoEvent = 'noEvent',
  EventTrigger = 'eventTrigger',
  // Not yet implemented in new mock
  EventNoLandfall = 'eventNoLandfall',
  EventNoLandfallYet = 'eventNoLandfallYet',
  EventNoTrigger = 'eventNoTrigger',
  EventAfterLandfall = 'eventAfterLandfall',
  // NOTE: this should also contain at least 1 multi-event scenario
}
