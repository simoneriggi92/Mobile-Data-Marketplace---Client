import {Component, EventEmitter, Output} from '@angular/core';
import {NgbCalendar, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {TimeService} from '../../service/time.service';
import {MessageService} from '../../service/message.service';
import {ResourceService} from '../../service/resource.service';
import {AuthService} from '../../service/auth.service';
import {PositionArray} from '../../model/position_array';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.css']
})
export class DatetimePickerComponent {
  hoveredDate: NgbDateStruct;

  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  time1 = {hour: 0, minute: 0};
  time2 = {hour: 0, minute: 0};
  fromTime: Date;
  toTime: Date;

  @Output() selected = new EventEmitter<number[]>();


  constructor(calendar: NgbCalendar, private timeService: TimeService,
              private authService: AuthService,
              private resourceService: ResourceService,
              private messageService: MessageService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
    this.fromTime = new Date();
    this.toTime = new Date();
  }

  onDateSelection(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  askPosition() {
    let response_body: PositionArray[] = [];

    this.fromTime.setHours(this.time1.hour);
    this.fromTime.setMinutes(this.time1.minute);
    this.toTime.setHours(this.time2.hour);
    this.toTime.setMinutes(this.time2.minute);

    const timestamps: number[] = [];
    if (this.fromDate != null && this.toDate != null && this.fromTime != null && this.toTime != null) {
      this.timeService.setTimestamp(this.fromDate, this.toDate, this.fromTime, this.toTime);
      const startTimestamp = this.timeService.getStartTimestamp();
      const endTimestamp = this.timeService.getEndTimestamp();
      timestamps.push(startTimestamp);
      timestamps.push(endTimestamp);

      for (let s of this.authService.getRoles()) {
        if (s === 'ADMIN') {
          this.selected.emit(timestamps);
        } else if (s === 'USER' || s === 'CUSTOMER') {
          this.resourceService.getPositions(this.authService.getUsername(), timestamps)
            .subscribe(data => {
              response_body = data as PositionArray[];
              this.initPopup(response_body);
            }, error => {
            });
        }
      }
    }
  }

  initPopup(body: PositionArray[]) {
    let pop_body = '';
    for (let i = 0; i < body.length; i++) {
      pop_body = pop_body + '\nPosizione(' + (i + 1) + ')'
        + ' latitudine: ' + body[i].position.x + '\n'
        + ' longitudine: ' + body[i].position.y + '\n'
        + ' timestamp: ' + body[i].timestamp + '\n' + '---';
    }
    this.messageService.add(pop_body);
    this.selected.emit(null);

  }

}
