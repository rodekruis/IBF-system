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

// Set this to true to temporarily test with old pipeline upload. Remove after all pipelines migrated.
export const MOCK_USE_OLD_PIPELINE_UPLOAD = false;
