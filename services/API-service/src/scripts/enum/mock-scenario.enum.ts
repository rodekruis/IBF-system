export enum FloodsScenario {
  Trigger = 'trigger',
  Warning = 'warning',
  WarningToTrigger = 'warning-to-trigger',
  NoTrigger = 'no-trigger',
}

export enum FlashFloodsScenario {
  Trigger = 'trigger',
  NoTrigger = 'no-trigger',
}

export enum EpidemicsScenario {
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
