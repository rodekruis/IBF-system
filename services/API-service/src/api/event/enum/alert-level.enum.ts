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
