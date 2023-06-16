import { Action } from '@ngrx/store';
import { Country } from '../../models/country.model';
import * as fromCountries from '../actions/countries.action';

export interface CountriesState {
  data: Country[];
  loaded: boolean;
  loading: boolean;
}

export const initialState = {
  data: [],
  loaded: false,
  loading: false,
};

export function reducer(state = initialState, action: Action): CountriesState {
  switch (action.type) {
    case fromCountries.LOAD_COUNTRIES: {
      return {
        ...state,
        loading: true,
      };
    }
    case fromCountries.LOAD_COUNTRIES_SUCCESS: {
      const payloadString = 'payload';
      return {
        ...state,
        data: action[payloadString],
        loading: false,
        loaded: true,
      };
    }
    case fromCountries.LOAD_COUNTRIES_FAIL: {
      return {
        ...state,
        loading: false,
        loaded: false,
      };
    }
  }

  return state;
}

export const getCountriesLoading = (state: CountriesState) => state.loading;
export const getCountriesLoaded = (state: CountriesState) => state.loaded;
export const getCountries = (state: CountriesState) => state.data;
