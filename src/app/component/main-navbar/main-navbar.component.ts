import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../service/auth.service';
import {Router} from '@angular/router';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {
  isNavbarCollapsed: boolean;
  faMapMarkerAlt = faMapMarkerAlt;

  constructor(public authService: AuthService, public router: Router) {
    this.isNavbarCollapsed = true;
  }

  ngOnInit() {
  }

  isLogged(): boolean {
    if (localStorage.getItem('access_token')) {
      return true;
    }
    return false;
  }


  logoutUser() {
    this.authService.logout().subscribe(() =>
      this.clearStorage()
    );
  }

  clearStorage() {
    localStorage.clear();
    this.router.navigate(['']);
  }


  isCustomer() {
    if (localStorage.getItem('access_token')) {
      for (let s of this.authService.getRoles()) {
        if (s === 'CUSTOMER') {
          return true;
        }
      }
    }
    return false;
  }

  isUser() {
    if (localStorage.getItem('access_token')) {
      for (let s of this.authService.getRoles()) {
        if (s === 'USER') {
          return true;
        }
      }
    }
    return false;
  }

  isAdmin() {
    if (localStorage.getItem('access_token')) {
      for (let s of this.authService.getRoles()) {
        if (s === 'ADMIN') {
          return true;
        }
      }
    }
    return false;
  }

  collapseNavbar() {
    this.isNavbarCollapsed = true;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

}
