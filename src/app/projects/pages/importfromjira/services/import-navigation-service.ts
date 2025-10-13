import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportNavigationService {
  private nextSubject = new Subject<void>();
  private previousSubject = new Subject<void>();

  next$ = this.nextSubject.asObservable();
  previous$ = this.previousSubject.asObservable();

  onNext() {
    this.nextSubject.next();
  }

  onPrevious() {
    this.previousSubject.next();
  }
}
