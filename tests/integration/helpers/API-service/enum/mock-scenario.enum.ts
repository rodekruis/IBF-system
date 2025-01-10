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
  Trigger = 'trigger',
  NoTrigger = 'no-trigger',
  Warning = 'warning',
  NoLandfallTrigger = 'no-landfall-trigger',
  NoLandfallYetWarning = 'no-landfall-yet-warning',
  OngoingTrigger = 'ongoing-trigger',
  WarningAndTrigger = 'warning-and-trigger',
}
