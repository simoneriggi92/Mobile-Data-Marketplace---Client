import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';

@Component({
  selector: 'app-input-time-picker',
  templateUrl: './input-time-picker.component.html',
  styleUrls: ['./input-time-picker.component.css']
})
export class InputTimePickerComponent implements OnInit {
  faClock = faClock;

  @Output() startTimeToParent = new EventEmitter<number>(); // create event that we will sent to the parent
  @Output() endTimeToParent = new EventEmitter<number>(); // create event that we will sent to the parent
  @Output() changeToParent = new EventEmitter<boolean>();

  mytime = {hour: 11, minute: 30};

  constructor() {
  }

  ngOnInit() {
  }

  // Range Date Notification to parent
  onInputFieldChanged(event: any) {
    this.startTimeToParent.emit(event);
    this.endTimeToParent.emit(event);
    this.changeToParent.emit(true);
  }

}
