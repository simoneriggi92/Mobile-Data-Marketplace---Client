import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    // Login Guard
    if (state.url === '/login') {
      if (localStorage.getItem('access_token')) {
        return false;
      }
      return true;
    }

    // Customer Guard
    if (state.url === '/profile') {
      if (localStorage.getItem('access_token')) {
        const role = this.auth.getRoles();

        if (role.toString() === next.data.expectedRole.toString()) {
          return true;
        }
        return false;
      }
    }

    // Customer Guard
    if (state.url === '/customer') {
      if (localStorage.getItem('access_token')) {
        const role = this.auth.getRoles();

        if (role.toString() === next.data.expectedRole.toString()) {
          return true;
        }
        return false;
      }
    }

    // User Guard
    if (state.url === '/user') {
      if (localStorage.getItem('access_token')) {
        const role = this.auth.getRoles();

        if (role.toString() === next.data.expectedRole.toString()) {
          return true;
        }
        return false;
      }
    }

    // Admin Guard
    if (state.url === '/admin') {
      if (localStorage.getItem('access_token')) {
        const role = this.auth.getRoles();

        if (role.toString() === next.data.expectedRole.toString()) {
          return true;
        }
        return false;
      }
    }

    if (state.url === '/loadArchive' || state.url === '/boughtArchive' || state.url === '/buyArchives') {
      if (localStorage.getItem('access_token')) {
        const role = this.auth.getRoles();

        if (role.toString() === next.data.expectedRole.toString()) {
          return true;
        }
        return false;
      }
    }
  }
}
