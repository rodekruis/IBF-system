import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new ReplaySubject<boolean>();

  constructor() {}

  getLoaderSubscription(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }

  setLoader(loading: boolean): void {
    this.loaderSubject.next(loading);
  }
}
