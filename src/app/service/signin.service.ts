import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Credentials} from '../model/credentials';
import {Observable, of} from 'rxjs';
import {UserModel} from '../model/user.model';

@Injectable({
  providedIn: 'root'
})

export class SigninService {
  serverAddress: string;
  private url = 'https://jsonplaceholder.typicode.com/users';

  private myHeader = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(@Inject('serverAddress')serverAddress, private http: HttpClient) {
    this.serverAddress = serverAddress;
  }

  signin(username: string, password: string, confirmPassword: string): Observable<UserModel | any> {

    let credentials = new Credentials(username, password, confirmPassword);

    let url = this.serverAddress +'/enrollment';
    let body = JSON.stringify(credentials);

    return this.http.post(url, body, {headers: this.myHeader});
  }

  getUserByUsername(uName: string) {
    return this.http.get<any[]>(this.serverAddress + '/enrollment/isUsernameUnique', {
      params: new HttpParams().set('username', uName)
    });
  }
}
