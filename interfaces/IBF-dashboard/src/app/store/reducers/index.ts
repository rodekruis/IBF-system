import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import * as fromCountries from './countries.reducer';

export interface DashboardState {
  countries: fromCountries.CountriesState;
}
export const reducers: ActionReducerMap<DashboardState> = {
  countries: fromCountries.reducer,
};

export const getDashboardState = createFeatureSelector<DashboardState>(
  'dashboard',
);

export const getCountriesState = createSelector(
  getDashboardState,
  (state: DashboardState) => state.countries,
);

export const getAllCountries = createSelector(
  getCountriesState,
  fromCountries.getCountries,
);
export const getCountriesLoaded = createSelector(
  getCountriesState,
  fromCountries.getCountriesLoaded,
);
export const getCountriesLoading = createSelector(
  getCountriesState,
  fromCountries.getCountriesLoading,
);
