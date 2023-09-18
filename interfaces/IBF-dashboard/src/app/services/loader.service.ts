import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  private queue = [];

  getLoaderSubscription(): Observable<boolean> {
    return this.loaderSubject.asObservable();
  }

  updateQueue(item: string, done: boolean): void {
    const queuePosition = this.queue.indexOf(item);
    if (done) {
      if (queuePosition >= 0) {
        this.queue.splice(queuePosition, 1);
      }
    } else {
      if (queuePosition < 0) {
        this.queue.push(item);
      }
    }
  }

  setLoader(item: string, done: boolean): void {
    this.updateQueue(item, done);
    this.loaderSubject.next(this.queue.length > 0);
  }
}
