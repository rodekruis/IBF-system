import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';

@Injectable({
  providedIn: 'root',
})
export class PlaceCodeService {
  private placeCodeSubject = new BehaviorSubject<PlaceCode>(null);

  constructor() {}

  getPlaceCodeSubscription(): Observable<PlaceCode> {
    return this.placeCodeSubject.asObservable();
  }

  setPlaceCode = (newPlaceCode: PlaceCode): void => {
    this.getPlaceCodeSubscription().subscribe(
      this.onPlaceCodeChangeByPlaceCode,
    );
    this.placeCodeSubject.next(newPlaceCode);
  };

  private onPlaceCodeChangeByPlaceCode = (newPlaceCode: PlaceCode) => (
    oldPlaceCode: PlaceCode,
  ) => {
    if (oldPlaceCode && newPlaceCode) {
      newPlaceCode =
        oldPlaceCode.placeCode === newPlaceCode.placeCode ? null : newPlaceCode;
    }
  };

  clearPlaceCode = (): void => {
    this.placeCodeSubject.next(null);
  };
}
