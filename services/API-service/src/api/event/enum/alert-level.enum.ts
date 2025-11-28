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
  [AlertLevel.NONE]: 4,
  [AlertLevel.WARNINGLOW]: 3,
  [AlertLevel.WARNINGMEDIUM]: 2,
  [AlertLevel.WARNING]: 1,
  [AlertLevel.TRIGGER]: 0,
};

export const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: 'No Alert',
  [AlertLevel.WARNINGLOW]: 'Low Warning',
  [AlertLevel.WARNINGMEDIUM]: 'Medium Warning',
  [AlertLevel.WARNING]: 'Warning',
  [AlertLevel.TRIGGER]: 'Trigger',
};

export const ALERT_LEVEL_ICON: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '',
  [AlertLevel.WARNINGLOW]: 'warning-low.png',
  [AlertLevel.WARNINGMEDIUM]: 'warning-medium.png',
  [AlertLevel.WARNING]: 'warning.png',
  [AlertLevel.TRIGGER]: 'trigger.png',
};

export const ALERT_LEVEL_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#ffd601', // fiveten-yellow-500
  [AlertLevel.WARNINGMEDIUM]: '#da7c00', // fiveten-orange-500
  [AlertLevel.WARNING]: '#da7c00', // fiveten-orange-500
  [AlertLevel.TRIGGER]: '#c70000', // fiveten-red-500
};

export const ALERT_LEVEL_TEXT_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#665606', // fiveten-yellow-700
  [AlertLevel.WARNINGMEDIUM]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.WARNING]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.TRIGGER]: '#c70000', // fiveten-red-500
};
