export enum AlertLevel {
  NONE = 'none',
  WARNINGLOW = 'warning-low',
  WARNINGMEDIUM = 'warning-medium',
  WARNING = 'warning',
  TRIGGER = 'trigger',
}

export const ALERT_LEVEL_WARNINGS = [
  AlertLevel.WARNINGLOW,
  AlertLevel.WARNINGMEDIUM,
  AlertLevel.WARNING,
];

export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = {
  [AlertLevel.NONE]: 0,
  [AlertLevel.WARNINGLOW]: 1,
  [AlertLevel.WARNINGMEDIUM]: 2,
  [AlertLevel.WARNING]: 3,
  [AlertLevel.TRIGGER]: 4,
};
