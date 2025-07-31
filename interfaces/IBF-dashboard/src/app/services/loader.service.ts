import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  private queue = [];

  constructor() {
    // Initialize with loading state false
    setTimeout(() => {
      this.loaderSubject.next(false);
    }, 0);
  }

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
    const isLoading = this.queue.length > 0;
    
    // Only log potential issues to avoid console clutter
    if (this.queue.length > 10) {
      console.warn(`⚠️ LoaderService: Queue getting large (${this.queue.length} items) - possible infinite loop`);
    }
    
    this.loaderSubject.next(isLoading);
  }
}
