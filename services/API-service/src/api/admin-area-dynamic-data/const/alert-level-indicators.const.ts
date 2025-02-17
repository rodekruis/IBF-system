import { DynamicIndicator } from '../enum/dynamic-indicator.enum';

// NOTE: this is verbose. Can this be done better?
export type AlertLevelIndicatorType =
  | 'alertThreshold'
  | 'forecastTrigger'
  | 'forecastSeverity';
export const ALERT_LEVEL_INDICATORS: {
  [key in AlertLevelIndicatorType]: DynamicIndicator;
} = {
  alertThreshold: DynamicIndicator.alertThreshold,
  forecastTrigger: DynamicIndicator.forecastTrigger,
  forecastSeverity: DynamicIndicator.forecastSeverity,
};
