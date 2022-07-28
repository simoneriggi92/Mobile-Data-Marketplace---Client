import {Component, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {faCalendarAlt, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BsDatepickerDirective} from 'ngx-bootstrap';

@Component({
  selector: 'app-input-range-datetime-picker',
  templateUrl: './input-range-date-picker.component.html',
  styleUrls: ['./input-range-date-picker.component.css'],
})


export class InputRangeDatePickerComponent implements OnInit {

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  @Output() startToParent = new EventEmitter<number>(); // create event that we will sent to the parent
  @Output() endToParent = new EventEmitter<number>(); // create event that we will sent to the parent
  @Output() resetToParent = new EventEmitter<boolean>();
  @Output() filterToParent = new EventEmitter<boolean>();
  @Output() changeToParent = new EventEmitter<boolean>();

  faCalendar = faCalendarAlt;
  faTimesCircle = faTimesCircle;
  myForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      range: ''
    });
  }

  onReset() {
    this.myForm.reset();
    this.resetToParent.emit(true);
    this.filterToParent.emit(false);
    //se reset data, invio true
    this.changeToParent.emit(true);
  }

  // Range Date Notification to parent
  onInputFieldChanged(event: any) {
    if (event.value.range) {
      this.startToParent.emit(event.value.range[0].getTime() / 1000);
      this.endToParent.emit(event.value.range[1].getTime() / 1000);
      this.resetToParent.emit(false);
      this.changeToParent.emit(true);
    }
  }

  @HostListener('window:resize')
  onScrollEvent() {
  }
}
