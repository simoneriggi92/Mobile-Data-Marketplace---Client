import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../service/auth.service';
import {ProfileService} from '../../service/profile.service';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  username: string;
  previousPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  dangerMessage: string;
  successMessage: string;
  currentWallet: number;
  myWallet: number;
  private _success = new Subject<string>();
  private _error = new Subject<string>();

  constructor(public authService: AuthService, private profileService: ProfileService) {
  }

  ngOnInit() {
    this.username = this.authService.getUsername();
    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(3000)
    ).subscribe(() => this.successMessage = null);
    this._error.subscribe((message) => this.dangerMessage = message);
    this._error.pipe(
      debounceTime(3000)
    ).subscribe(() => this.dangerMessage = null);
    this.getCurrentWallet();
  }

  updateAccount() {
    this.profileService.updatePassword(this.username, this.previousPassword, this.newPassword, this.confirmNewPassword).subscribe(
      data => {
        this._success.next('Password Update Successful');
      },
      error => {
        this._error.next(error.error.error);
      }
    );
  }

  updatePocket() {
    this.profileService.updateWallet(this.myWallet).subscribe(
      data => {
        this._success.next('Wallet Update Successful');
        this.getCurrentWallet();
      },
      error => {
        this._error.next('Wallet Update Failed');
      }
    );
  }

  private getCurrentWallet(): any {
    this.profileService.getWallet().subscribe(
      data => {
        this.currentWallet = Math.round(data.amount * 100) / 100;
      },
      error => {
        this._error.next('Something goes wrong');
      }
    );
  }
}
