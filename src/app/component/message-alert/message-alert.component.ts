import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {MessageService} from '../../service/message.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-message-alert',
  templateUrl: './message-alert.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./message-alert.component.css']
})
export class MessageAlertComponent implements OnInit {
  buyAck: boolean;

  isUser: boolean;
  isCustomer: boolean;
  closeResult: string;
  @Output() bought = new EventEmitter<any>();

  @ViewChild('content') content: ElementRef;

  constructor(private modalService: NgbModal, public messageService: MessageService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.checkRole();
  }

  openVerticallyCentered(flag: boolean) {
    this.buyAck = flag;
    this.modalService.open(this.content, {centered: true}).result.then((result) => {
      this.closeResult = result;
      if (this.closeResult === 'Buy click') {
        this.sendToRoot();
        this.messageService.clear();
      } else if (this.closeResult === 'Cross click') {
        this.messageService.clear();
        this.sendToRoot2();
      }
    });
  }


  openVerticallyCentered2() {
    this.modalService.open(this.content, {centered: true}).result.then((result) => {
      this.closeResult = result;
      if (this.closeResult = 'Cross click') {
        this.messageService.clear();
      }
    });
  }


  sendToRoot() {
    this.bought.emit(true);
  }

  sendToRoot2() {
    // this.refuse.emit(true);
  }

  checkRole() {
    for (let s of this.authService.getRoles()) {
      if (s === 'USER') {
        this.isUser = true;
        // this.isCustomer = false;
      } else if (s === 'CUSTOMER') {
        // this.isUser = false;
        this.isCustomer = true;
      }
    }

  }
}
