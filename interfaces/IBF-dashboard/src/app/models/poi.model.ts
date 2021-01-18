// tslint:disable: variable-name
export class Station {
  station_name: string;
  station_code: string;
  trigger_level: number;
  fc: number;
  fc_trigger: string;
}

export class RedCrossBranch {
  name: string;
  nr_volunteers: number;
  contact_person: string;
  contact_address: string;
  contact_number: string;
}

export class Waterpoint {
  wpdxId: string;
  activityId: string;
  type: string;
  reportDate: string;
}
