import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CountryService } from '../../services/country.service';
import * as countriesActions from '../actions/countries.action';

@Injectable({ providedIn: 'root' })
export class CountriesEffects {
  constructor(
    private actions$: Actions,
    private countryService: CountryService,
  ) {}

  loadCountriesBy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(countriesActions.LOAD_COUNTRIES),
      switchMap(() => {
        return this.countryService.getAllCountries(true).pipe(
          map(
            (countries) => new countriesActions.LoadCountriesSuccess(countries),
          ),
          catchError((error) =>
            of(new countriesActions.LoadCountriesFail(error)),
          ),
        );
      }),
    ),
  );
}
