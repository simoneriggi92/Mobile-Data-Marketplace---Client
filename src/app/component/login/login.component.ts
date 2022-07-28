import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {MessageService} from '../../service/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  message: any;
  subscription: Subscription;


  constructor(private authService: AuthService, public router: Router, public messageService: MessageService) {
    this.subscription = this.messageService.getMessage().subscribe(message => {
      this.message = message;
    });
  }

  ngOnInit() {
  }

  loginUser() {
    this.authService.login('password', this.username, this.password)
      .subscribe(data => this.setSession(data));
  }

  public isLoggedIn(): boolean {
    if (localStorage.getItem('access_token')) {
      return true;
    } else {
      return false;
    }
  }

  private setSession(authResult) {

    const expiresAt = moment().add(authResult.expires_in, ' seconds ');
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('expires_in', JSON.stringify(expiresAt.valueOf()));
    localStorage.setItem('refresh_token', authResult.refresh_token);

    for (let s of this.authService.getRoles()) {
      if (s === 'CUSTOMER' || s === 'USER') {
        this.router.navigate(['/']);
      } else if (s === 'ADMIN') {
        this.router.navigate(['/admin']);
      }
    }
  }
}
