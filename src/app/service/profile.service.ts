import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UpdateCredential} from '../model/updateCredential';
import {Observable} from 'rxjs';
import {UserModel} from '../model/user.model';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private myHeader = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  serverAddress: string;
  constructor(@Inject('serverAddress')serverAddress, private authService: AuthService, private http: HttpClient) {
    this.serverAddress = serverAddress;
  }

  updatePassword(username, oldPassword, newPassword, confirmNewPassword): Observable<UserModel | any>{
    let url = this.serverAddress + '/api/updateEnrollment';
    let body = JSON.stringify(new UpdateCredential(username, oldPassword, newPassword, confirmNewPassword));
    return this.http.put<UserModel | any>(url, body, {headers: this.myHeader});
  }

  updateWallet(money: number): Observable<UserModel | any> {
    let url = this.serverAddress + '/api/updateWallet';
    let user = new UserModel(null);
    user.amount = money;
    let body = JSON.stringify(user);

    return this.http.put<UserModel | any>(url, body, {headers: this.myHeader});
  }

  getWallet(): Observable<UserModel> {
    let myUsername = this.authService.getUsername();
    let url = this.serverAddress + '/api/users/' + myUsername;
    return this.http.get<UserModel>(url);
  }
}
