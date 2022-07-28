import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Point} from '../model/point.model';
import {Observable, throwError} from 'rxjs';
import {UserModel} from '../model/user.model';
import {FormArray} from '@angular/forms';
import {InvalidPosition} from '../model/invalid_position';
import {Position} from '../model/position';
import {PositionPacket} from '../model/position-packet';
import {PositionArray} from '../model/position-array';
import {CustomerTransaction} from '../model/customer-transaction';
import {CustomerProfileInfo} from '../model/customer-profile-info';
import {MessageService} from './message.service';
import {AuthService} from './auth.service';
import {PositionsResponseContainer} from '../model/positions-response-container';
import {catchError} from 'rxjs/operators';

const tokenHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  // access_token = localStorage.getItem('access_token');
  // payload_token = jwt_decode(this.access_token);
  // user_name = this.payload_token.user_name;
  serverAddress: string;
  username: string;
  startTimestamp: number;
  endTimestamp: number;
  points: Point[] = [];


  private tokenHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(@Inject('serverAddress')serverAddress, public http: HttpClient, private messageService1: MessageService,
              private messageService2: MessageService,
              private authService: AuthService) {
    this.serverAddress = serverAddress;
  }

  getPositions(username: string, timestamps: number[]) {

    let minTime;
    let maxTime;

    if (timestamps != null) {
      minTime = timestamps[0].toString();
      maxTime = timestamps[1].toString();
    }

    if (timestamps != null && username !== 'All') {
      return this.http.get(this.serverAddress + '/api/users/' + username + '/positions?mintime=' + minTime + '&maxtime=' + maxTime);
    }

    if (timestamps == null && username !== 'All') {
      return this.http.get(this.serverAddress + '/api/users/' + username + '/positions');
    }

    if (timestamps != null && username === 'All') {
      return this.http.get(this.serverAddress + '/api/positions?mintime=' + minTime + '&maxtime=' + maxTime);
    }

    if (timestamps == null && username === 'All') {
      this.getAllPositions();
    }
  }

  getAllPositions() {
    return this.http.get(this.serverAddress + '/api/positions');
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.serverAddress + '/api/users');
  }

  postPositions(positions: FormArray) {
    let username = this.authService.getUsername();
    let list: Position[] = [];
    let errorList: InvalidPosition;
    for (let i = 0; i < positions.length; i++) {
      let p: Position = new Position(positions.at(i).get('latitude').value,
        positions.at(i).get('longitude').value,
        positions.at(i).get('timestamp').value);
      list.push(p);
    }
    let str = JSON.stringify(list);
    let body = new URLSearchParams();
    return this.http.post(this.serverAddress + '/api/users/' + username + '/positions', str.toString(), {headers: this.tokenHeaders});

  }

  getTransactions(username: string) {
    let user: string;
    if (username !== ' ') {
      user = username.trim();
    }
    if (username !== ' ') {
      return this.http.get(this.serverAddress + '/api/customers/' + user + '/transactions');
    } else {
      return this.http.get(this.serverAddress + '/api/transactions');
    }
  }

  getPositionsInsidePolygon(points: FormArray, timestamps: number[]): string[] {
    this.username = this.authService.getUsername();
    let info: string[] = [];
    this.endTimestamp = timestamps.pop();
    this.startTimestamp = timestamps.pop();
    let positionPacket: PositionPacket = {position_numbers: 0, users_numbers: 0};
    let position_number: number;
    position_number = 0;

    for (let i = 0; i < points.length; i++) {
      let p: Point = {latitude: points.at(i).get('latitude').value, longitude: points.at(i).get('longitude').value};
      // point.longitude = polygon[i][0]
      this.points.push(p);
    }
    // tslint:disable-next-line:max-line-length
    this.http.post(this.serverAddress + '/api/customers/' + this.username + '/positions' + '?mintime=' + this.startTimestamp + '&maxtime=' + this.endTimestamp, JSON.stringify(this.points), tokenHeaders)
      .subscribe(data => {
        positionPacket = data as PositionPacket;
        info.push('Number of positions: ' + positionPacket.position_numbers);
        info.push('Number of users: ' + positionPacket.users_numbers);
        // tslint:disable-next-line:max-line-length
        this.messageService1.add('Numero di posizioni: ' + positionPacket.position_numbers + '\nNumero di utenti: ' + positionPacket.users_numbers);
      });
    return info;
  }

  getValidPosition(): Observable<PositionArray[]> {
    this.username = this.authService.getUsername();
    // tslint:disable-next-line:max-line-length
    return this.http.post<PositionArray[]>(this.serverAddress + '/api/customers/' + this.username + '/positions/buy' + '?mintime=' + this.startTimestamp + '&maxtime=' + this.endTimestamp, JSON.stringify(this.points), tokenHeaders)
      .pipe(catchError(this.handleError('getValidPositions', [])));

  }

  getCustomerTransactions(): Observable<CustomerTransaction[]> {
    this.username = this.authService.getUsername();
    return this.http.get<CustomerTransaction[]>(this.serverAddress + '/api/customers/' + this.username + '/transactions', tokenHeaders);
  }

  getCustomerProfileInfo(): Observable<CustomerProfileInfo> {
    // tslint:disable-next-line:max-line-length
    this.username = this.authService.getUsername();
    return this.http.get<CustomerProfileInfo>(this.serverAddress + '/api/customers/' + this.username, tokenHeaders);
  }

  setAckMessage(f: boolean) {
    if (f === true) {
      this.messageService2.add('Il tuo acquisto e\' andato a buon fine!');
    } else {
      this.messageService2.add('Ops! Il tuo acquisto non e\' andato a buon fine! :(');
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // Let the app keep running by returning an empty result.
      // return of(result as T);
      return throwError(
        'Something bad happened; please try again later.');
    };
  }

  // ritorna tutte le posizioni approssimate degli utenti
  getAllApproximatePositions(): Observable<PositionsResponseContainer> {
    let timestamps: number[];
    let now = new Date();
    let result: string[];
    let points: Point[] = [];
    this.username = this.authService.getUsername();
    this.endTimestamp = 1942494162;
    this.startTimestamp = 1;
    let positionPacket: PositionPacket = {position_numbers: 0, users_numbers: 0};
    let position_number: number;
    position_number = 0;
    let info: string[] = [];
    let p1: Point = {latitude: 46.19, longitude: 7.65};
    let p2: Point = {latitude: 44.46, longitude: 9.28};
    let p3: Point = {latitude: 44.46, longitude: 5.72};
    points.push(p1);
    points.push(p2);
    points.push(p3);
    // tslint:disable-next-line:max-line-length
    return this.http.post<PositionsResponseContainer>(this.serverAddress + '/api/customers/' + this.username + '/positions' + '?mintime=' + this.startTimestamp + '&maxtime=' + this.endTimestamp, JSON.stringify(points), tokenHeaders);
  }

  errorHandler() {
    console.log('error handler');
  }
}
