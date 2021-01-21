import { Geometry } from './geo.model';

export class AdminAreaDataRecord {
  public pcode_level2: string;
  public name: string;
  public pcode_level1: string;
  public geom: Geometry;
  public country_code: string;
  public pcode: string;
  public date: Date;
  public current_prev: string;
  public lead_time: string;
  public fc: number;
  public fc_trigger: number;
  public fc_rp: null;
  public fc_perc: null;
  public fc_prob: number;
  public fc_trigger2: number;
  public other_lead_time_trigger: number;
  public population_affected: number;
  public livestock_affected: number;
  public chicken_affected: null;
  public cattle_affected: null;
  public goat_affected: null;
  public pig_affected: null;
  public sheep_affected: null;
  public cropland_affected: number;
  public indicators: {
    pcode: string;
    birth_certificate_0_17: number;
    birth_u18: number;
    copmleted_o_level: number;
    disability: number;
    drinking_water: number;
    drought_phys_exp: number;
    earthquake7_phys_exp: number;
    education_density: number;
    electricity_access: number;
    elevation: number;
    far_health: number;
    far_school: number;
    far_school_sec: number;
    far_waterpoint: number;
    female_head_hh: number;
    flood_phys_exp: number;
    has_bank_account: number;
    health_density: number;
    illiteracy: number;
    incident_density: number;
    internet_access: number;
    land_area: number;
    married_u18: null;
    mobile_phone_access: number;
    mosquito_nets: number;
    no_toilet: number;
    nr_of_hospitals: number;
    nr_refugees: null;
    old_head_hh: number;
    orphanhood: number;
    own_bicycle: number;
    own_computer: number;
    own_radio: number;
    own_television: number;
    owner_plot: number;
    pop_density: number;
    population: number;
    population_over65: number;
    population_u8: number;
    poverty_incidence: number;
    received_remittances: number;
    refugee_density: null;
    roof_type: number;
    school_not_attending: number;
    subsistence_farming_old: number;
    traveltime: number;
    wall_type: number;
    working_10_17: number;
    working_18plus: number;
    young_head_hh: number;
    pcode_level2: string;
    pcode_level1_copy: string;
    population_copy: number;
    flood_phys_exp_score: number;
    earthquake7_phys_exp_score: number;
    drought_phys_exp_score: number;
    incident_density_score: number;
    hazard_score: number;
    wall_type_score: number;
    roof_type_score: number;
    poverty_incidence_score: number;
    orphanhood_score: number;
    mosquito_nets_score: number;
    disability_score: number;
    population_over65_score: number;
    working_18plus_score: number;
    working_10_17_score: number;
    birth_certificate_0_17_score: number;
    school_not_attending_score: number;
    married_u18_score: null;
    female_head_hh_score: number;
    young_head_hh_score: number;
    copmleted_o_level_score: number;
    population_u8_score: number;
    illiteracy_score: number;
    old_head_hh_score: number;
    vulnerability_score: number;
    mobile_phone_access_score: number;
    internet_access_score: number;
    health_density_score: number;
    electricity_access_score: number;
    education_density_score: number;
    drinking_water_score: number;
    traveltime_score: number;
    owner_plot_score: number;
    received_remittances_score: number;
    own_bicycle_score: number;
    far_school_sec_score: number;
    has_bank_account_score: number;
    far_waterpoint_score: number;
    own_computer_score: number;
    far_school_score: number;
    own_television_score: number;
    far_health_score: number;
    own_radio_score: number;
    no_toilet_score: number;
    coping_capacity_score: number;
    risk_score: number;
    vulnerability_index: number;
  };
}

export class TriggeredArea {
  public pcode: string;
  public name: string;
  public population_affected: number;
}

export class DisasterEvent {
  public country_code: string;
  public start_date: Date;
  public end_date?: Date;
  public id: number;
}

export class CountryMetaData {
  public id: string;
  public country_code: string;
  public name: string;
  public label: string;
  public group: string;
  public icon: string;
  public weightedAvg: boolean;
  public numberFormatMap: string;
  public aggregateIndicator: true;
  public numberFormatAggregate: string;
  public source: string;
  public description: string;
}

export class Aggregates {
  public population_affected: number;
  public vulnerability_index: number;
  public poverty_incidence: number;
  public female_head_hh: number;
  public population_u8: number;
  public population_over65: number;
  public wall_type: number;
  public roof_type: number;
}
