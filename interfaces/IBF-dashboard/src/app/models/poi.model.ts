// tslint:disable: variable-name
export class Station {
  station_name: string;
  station_code: string;
  trigger_level: number;
  fc: number;
  fc_trigger: number;
  fc_prob: number;
}

export class RedCrossBranch {
  name: string;
  numberOfVolunteers: number;
  contactPerson: string;
  contactAddress: string;
  contactNumber: string;
}

export class Waterpoint {
  wpdxId: string;
  activityId: string;
  type: string;
  reportDate: string;
}
