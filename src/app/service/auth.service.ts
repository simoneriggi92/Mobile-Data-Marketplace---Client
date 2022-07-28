import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  serverAddress: string;
  private auth64 = btoa('group3ClientId:group3Secret');
  private tokenHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + this.auth64
  });

  constructor(@Inject('serverAddress')serverAddress, private http: HttpClient) {
    this.serverAddress = serverAddress;
  }

  login(grant_type: string, username: string, password: string) {
    localStorage.clear();
    let body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);

    return this.http.post(this.serverAddress + '/' + 'oauth/token', body.toString(), {headers: this.tokenHeaders});
  }

  public isLoggedOut() {
    // return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_in');
    const expires_in = JSON.parse(expiration);
    return expires_in;
  }

  getAccessToken() {

    const access_token = localStorage.getItem('access_token');
    if (access_token != null) {
      return access_token;
    }
  }

  getRefreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');
    return refresh_token;
  }

  logout() {
    return this.http.post(this.serverAddress + '/' + 'api/logout', null);
  }

  public getRoles(): string[] {
    const token = localStorage.getItem('access_token');
    const payloadToken = jwt_decode(token);
    let roles: string[] = [];
    roles = payloadToken.authorities;
    return roles;
  }

  public getUsername(): string {
    const token = localStorage.getItem('access_token');
    const payloadToken = jwt_decode(token);
    const username = payloadToken.user_name.toString();
    return username;
  }
}
