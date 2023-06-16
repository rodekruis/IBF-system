import { Action } from '@ngrx/store';
import { Country } from '../../models/country.model';

// load countries
export const LOAD_COUNTRIES = '[Dashboard] Load Countries';
export const LOAD_COUNTRIES_FAIL = '[Dashboard] Load Countries Fail';
export const LOAD_COUNTRIES_SUCCESS = '[Dashboard] Load Countries Success';

export class LoadCountries implements Action {
  readonly type = LOAD_COUNTRIES;
}

export class LoadCountriesFail implements Action {
  readonly type = LOAD_COUNTRIES_FAIL;
  constructor(public payload: any) {}
}

export class LoadCountriesSuccess implements Action {
  readonly type = LOAD_COUNTRIES_SUCCESS;
  constructor(public payload: Country[]) {}
}

export type CountriesAction =
  | LoadCountries
  | LoadCountriesFail
  | LoadCountriesSuccess;
