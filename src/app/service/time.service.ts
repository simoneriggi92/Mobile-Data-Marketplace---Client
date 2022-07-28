import {Injectable} from '@angular/core';
import {NgbCalendar, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  startTimestamp: number;
  endTimestamp: number;

  constructor() {
  }

  setTimestamp(fromDate: NgbDateStruct, toDate: NgbDateStruct, fromTime: Date, toTime: Date) {

    let data1: string;
    let data2: string;
    data1 = fromDate.year + '/' + fromDate.month + '/' + fromDate.day + ' ' +
      fromTime.getHours() + ':' + fromTime.getMinutes() + ':' + fromTime.getSeconds();
    data2 = toDate.year + '/' + toDate.month + '/' + toDate.day + ' ' +
      toTime.getHours() + ':' + toTime.getMinutes() + ':' + fromTime.getSeconds();
    this.startTimestamp = new Date(data1).getTime() / 1000;
    this.endTimestamp = new Date(data2).getTime() / 1000;
  }

  getStartTimestamp(): number {
    if (this.startTimestamp !== 0) {
      return this.startTimestamp;
    }
  }

  getEndTimestamp(): number {
    if (this.endTimestamp !== 0) {
      return this.endTimestamp;
    }
  }
}
