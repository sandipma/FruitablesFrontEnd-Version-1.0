import { Injectable } from '@angular/core';
import { Observable, map, take, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  // Variable declaration //
  public remainingTime: number;
  private readonly duration: number = 30;
  private timer$: Observable<number>;

  // Constructor Initilisation //
  constructor() {
    this.timer$ = timer(0, 1000);
  }

  //****************Methods ***************//
  // Method for start timer //
  startTimer(): Observable<number> {
    return this.timer$.pipe(
      map(second => this.duration - second),
      take(this.duration + 1)
    );
  }
}
