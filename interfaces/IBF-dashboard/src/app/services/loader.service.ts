import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(true);

  constructor() {}

  getLoaderSubscription(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }

  setLoader(loading: boolean): void {
    this.loaderSubject.next(loading);
  }
}
