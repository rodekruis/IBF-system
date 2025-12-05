/* eslint-disable perfectionist/sort-enums */

import { EapAlertClass } from 'src/app/models/poi.model';

export enum AlertLevel {
  NONE = 'none',
  WARNINGLOW = 'warning-low',
  WARNINGMEDIUM = 'warning-medium',
  WARNING = 'warning',
  TRIGGER = 'trigger',
}

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

export const ALERT_LEVEL_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#ffd601', // fiveten-yellow-500
  [AlertLevel.WARNINGMEDIUM]: '#da7c00', // fiveten-orange-500
  [AlertLevel.WARNING]: '#da7c00', // fiveten-orange-500
  [AlertLevel.TRIGGER]: '#c70000', // fiveten-red-500
};

export const ALERT_LEVEL_COLOUR_CONTRAST: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#ffffff', // fiveten-neutral-0
  [AlertLevel.WARNINGLOW]: '#665606', // fiveten-yellow-700
  [AlertLevel.WARNINGMEDIUM]: '#ffffff', // fiveten-neutral-0
  [AlertLevel.WARNING]: '#ffffff', // fiveten-neutral-0
  [AlertLevel.TRIGGER]: '#ffffff', // fiveten-neutral-0
};

export const ALERT_LEVEL_TEXT_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#665606', // fiveten-yellow-700
  [AlertLevel.WARNINGMEDIUM]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.WARNING]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.TRIGGER]: '#940000', // fiveten-red-700
};

// REFACTOR: remove in favour of Tailwind v4 custom colours
// https://tailwindcss.com/docs/background-color#using-a-custom-value
export const ALERT_LEVEL_COLOUR_CLASS: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: 'fiveten-navy-900',
  [AlertLevel.WARNINGLOW]: 'fiveten-yellow-500',
  [AlertLevel.WARNINGMEDIUM]: 'fiveten-orange-500',
  [AlertLevel.WARNING]: 'fiveten-orange-500',
  [AlertLevel.TRIGGER]: 'fiveten-red-500',
};

// REFACTOR: remove in favour of Tailwind v4 custom colours
// https://tailwindcss.com/docs/background-color#using-a-custom-value
export const ALERT_LEVEL_COLOUR_CONTRAST_CLASS: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: 'fiveten-neutral-0',
  [AlertLevel.WARNINGLOW]: 'fiveten-yellow-700',
  [AlertLevel.WARNINGMEDIUM]: 'fiveten-neutral-0',
  [AlertLevel.WARNING]: 'fiveten-neutral-0',
  [AlertLevel.TRIGGER]: 'fiveten-neutral-0',
};

// REFACTOR: remove in favour of Tailwind v4 custom colours
// https://tailwindcss.com/docs/background-color#using-a-custom-value
export const ALERT_LEVEL_TEXT_COLOUR_CLASS: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: 'fiveten-navy-900',
  [AlertLevel.WARNINGLOW]: 'fiveten-yellow-700',
  [AlertLevel.WARNINGMEDIUM]: 'fiveten-orange-700',
  [AlertLevel.WARNING]: 'fiveten-orange-700',
  [AlertLevel.TRIGGER]: 'fiveten-red-700',
};

// REFACTOR: remove in favour of alert level instead of eap alert classes
export const eapAlertClassToAlertLevel: Record<EapAlertClass, AlertLevel> = {
  no: AlertLevel.NONE,
  min: AlertLevel.WARNINGLOW,
  med: AlertLevel.WARNINGMEDIUM,
  max: AlertLevel.TRIGGER,
};
