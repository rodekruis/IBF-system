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
    this.getPlaceCodeSubscription().subscribe((oldPlaceCode: PlaceCode) => {
      if (oldPlaceCode) {
        newPlaceCode =
          oldPlaceCode.placeCode === newPlaceCode.placeCode
            ? null
            : newPlaceCode;
      }
      this.placeCodeSubject.next(newPlaceCode);
    });
  };

  clearPlaceCode = (): void => {
    this.placeCodeSubject.next(null);
  };
}
