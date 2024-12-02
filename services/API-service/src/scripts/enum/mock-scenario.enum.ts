export enum FloodsScenario {
  Trigger = 'trigger',
  Warning = 'warning',
  WarningToTrigger = 'warning-to-trigger',
  NoTrigger = 'no-trigger',
}

export enum FlashFloodsScenario {
  Trigger = 'trigger',
  SingleEvent = 'single-event',
  NoTrigger = 'no-trigger',
}

export enum EpidemicsScenario {
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
