import {Component, OnInit} from '@angular/core';
import {SigninService} from '../../service/signin.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  username = '';
  password = '';
  confirmPassword = '';
  dangerMessage: string;
  successMessage: string;

  constructor(private signinService: SigninService, public router: Router) {
  }

  ngOnInit() {
    this.dangerMessage = null;
    this.successMessage = null;
  }

  signInUser() {
    this.signinService.signin(this.username, this.password, this.confirmPassword).subscribe(
      data => {
        this.successMessage = 'Registration succesfully executed';
        setTimeout(() =>
          {
            this.router.navigate(['/login']);
          },
          1000);
      },
      error => {
        this.dangerMessage = error.error.error;
      }
    );
  }
}
