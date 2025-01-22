import { DisasterType } from 'src/app/models/country.model';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime, LeadTimeUnit } from 'src/app/types/lead-time';

export const MOCK_DISASTERTYPE: DisasterType = {
  disasterType: DisasterTypeKey.floods,
  label: 'flood',
  leadTimeUnit: LeadTimeUnit.day,
  minLeadTime: LeadTime.day0,
  maxLeadTime: LeadTime.day7,
  actionsUnit: IbfLayerName.population_affected,
  triggerUnit: IbfLayerName.alertThreshold,
  activeTrigger: false,
};
