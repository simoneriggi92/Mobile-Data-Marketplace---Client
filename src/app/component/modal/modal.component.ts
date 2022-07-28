import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BuyArchiveService} from '../../service/buy-archive.service';
import {PositionsContainer} from '../../model/positionsContainer';
import {AuthService} from '../../service/auth.service';
import {Archive} from '../../model/archive';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  messageError: string = '';
  messageSuccess: string = '';
  messageWarning: string = '';
  dataToBuy: PositionsContainer;
  closeResult: string;
  price: number;
  nArchives: number;
  nAcceptedArchives: string;
  nRefusedArchives: string;
  nPositions: number;
  nUsers: number;
  paymentsResult: boolean;
  @ViewChild('content') content: ElementRef;
  @Output() resetPage = new EventEmitter<boolean>();

  constructor(private modalService: NgbModal, private buyArchiveService: BuyArchiveService, private authService: AuthService) {
  }

  ngOnInit() {
  }

  openVertical(data: PositionsContainer) {
    this.resetMessages();
    this.dataToBuy = data;
    this.price = data.total;
    this.nArchives = data.archiveList.length;
    this.nPositions = data.n_positions;
    this.nUsers = data.n_users;
    this.modalService.open(this.content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      if (this.paymentsResult) {
        this.resetPage.emit(true);
      }
    }, (reason) => {
      if (this.paymentsResult) {
        this.resetPage.emit(true);
      }
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  confirmPayment() {
    this.resetMessages();
    let username = this.authService.getUsername();
    this.buyArchiveService.confirmPayment(this.dataToBuy, username).subscribe(
      (data) => {
        data = data as Archive[];
        if (data.length !== this.nArchives) {
          let refusedArchives = (this.nArchives - data.length);
          let acceptedArchives = data.length;
          this.messageWarning = 'Some of asked Archives has been already Bought';
          this.price = acceptedArchives * 0.7;
          this.nAcceptedArchives = acceptedArchives.toString();
          this.nRefusedArchives = refusedArchives.toString();
          this.messageSuccess = '';
        } else {
          this.messageSuccess = 'Purchase successfull';
          this.paymentsResult = true;
        }
      },
      (error) => {
        this.messageError = error.error.error;
        this.paymentsResult = true;
      }
    );
  }

  resetMessages() {
    this.messageSuccess = '';
    this.messageError = '';
    this.messageWarning = '';
    this.nAcceptedArchives = '';
    this.nRefusedArchives = '';
    this.paymentsResult = false;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
