/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export class Poi {
  code: string;
  name: string;
  geom: string;
}

export class Station extends Poi {
  trigger_level?: number;
  fc: number;
  fc_trigger: number;
  fc_perc: number;
  fc_prob: number;
}
