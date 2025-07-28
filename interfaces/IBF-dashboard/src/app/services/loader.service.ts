import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  private queue = [];

  constructor() {
    console.log('🔄 LoaderService: Initialized with loading state: false');
    
    // Ensure initial state is properly emitted
    setTimeout(() => {
      console.log('🔄 LoaderService: Forcing initial state emission');
      this.loaderSubject.next(false);
    }, 0);
  }

  getLoaderSubscription(): Observable<boolean> {
    console.log('🔄 LoaderService: New subscription created, current loading state:', this.loaderSubject.value);
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
    
    // Debug logging to track loader state
    console.log(`🔄 LoaderService: ${done ? 'FINISHED' : 'STARTED'} request "${item}"`);
    console.log(`📊 Current queue (${this.queue.length} items):`, [...this.queue]);
    console.log(`🎯 Setting loader to: ${isLoading ? 'LOADING' : 'READY'}`);
    
    // Detect potential infinite loop
    if (this.queue.length > 10) {
      console.warn(`⚠️ LoaderService: Queue getting large (${this.queue.length} items) - possible infinite loop`);
    }
    
    this.loaderSubject.next(isLoading);
  }
}
