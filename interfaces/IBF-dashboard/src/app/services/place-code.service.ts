import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';

@Injectable({
  providedIn: 'root',
})
export class PlaceCodeService {
  private placeCodeSubject = new BehaviorSubject<PlaceCode>(null);
  private placeCodeHoverSubject = new BehaviorSubject<PlaceCode>(null);

  getPlaceCodeSubscription(): Observable<PlaceCode> {
    return this.placeCodeSubject.asObservable();
  }

  setPlaceCode = (newPlaceCode: PlaceCode): void => {
    this.getPlaceCodeSubscription().subscribe(
      this.onPlaceCodeChangeByPlaceCode,
    );
    this.placeCodeSubject.next(newPlaceCode);
  };

  private onPlaceCodeChangeByPlaceCode =
    (newPlaceCode: PlaceCode) => (oldPlaceCode: PlaceCode) => {
      if (oldPlaceCode && newPlaceCode) {
        newPlaceCode =
          oldPlaceCode.placeCode === newPlaceCode.placeCode
            ? null
            : newPlaceCode;
      }
    };

  clearPlaceCode = (): void => {
    this.placeCodeSubject.next(null);
  };

  getPlaceCodeHoverSubscription(): Observable<PlaceCode> {
    return this.placeCodeHoverSubject.asObservable();
  }

  setPlaceCodeHover = (newPlaceCode: PlaceCode): void => {
    this.getPlaceCodeHoverSubscription().subscribe(
      this.onPlaceCodeHoverChangeByPlaceCode,
    );
    this.placeCodeHoverSubject.next(newPlaceCode);
  };

  private onPlaceCodeHoverChangeByPlaceCode =
    (newPlaceCode: PlaceCode) => (oldPlaceCode: PlaceCode) => {
      if (oldPlaceCode && newPlaceCode) {
        newPlaceCode =
          oldPlaceCode.placeCode === newPlaceCode.placeCode
            ? null
            : newPlaceCode;
      }
    };

  clearPlaceCodeHover = (): void => {
    this.placeCodeHoverSubject.next(null);
  };
}
