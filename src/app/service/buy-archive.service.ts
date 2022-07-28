import {Inject, Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {BoughtArchive} from '../model/boughtArchive';
import {Observable, of} from 'rxjs';
import {PositionsContainer} from '../model/positionsContainer';
import {Position} from '../model/position';
import {BuyRequest} from '../model/buyRequest';
import {Archive} from '../model/archive';

@Injectable({
  providedIn: 'root'
})
export class BuyArchiveService {
  serverAddress: string;
  private myHeader = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(@Inject('serverAddress')serverAddress, private http: HttpClient, private authService: AuthService) {
    this.serverAddress = serverAddress;
  }

  // Richiesta per avere la lista di tutti gli ID di tutti gli utenti
  getUsersId(): Observable<string[]> {
    let url = this.serverAddress + '/api/users_id';
    return this.http.get<string[]>(url)
      .pipe(
        tap(usersList => console.log('usersList: ', usersList)),
        catchError(this.handleError('getUsersId', []))
      );
  }

  // Richiesta per avere tutte le posizioni di tutti gli utenti all'interno del poligono (o della mappa)
  getAllUsersPositionsInPoligon(startTimestamp: number, endTimestamp: number, points: Position[]): Observable<PositionsContainer> {
    let url = this.serverAddress + '/api/users/all/positions?mintime=' + startTimestamp + '&maxtime=' + endTimestamp;

    return this.http.post<PositionsContainer>(url, JSON.stringify(points), {headers: this.myHeader})
      .pipe(
        tap(data => console.log('getAllUsersPositionsInPolygon: ' + JSON.stringify(data))),
        catchError(this.handleError<PositionsContainer>('getAllUsersPositionsInPolygon '))
      );
  }

  // Richiesta per avere la lista di tutti gli archivi acquistati da un dato utente
  getBoughtArchives(): Observable<BoughtArchive[]> {
    let username = this.authService.getUsername();
    let url = this.serverAddress + '/api/customers/' + username + '/archives';

    return this.http.get<BoughtArchive[]>(url)
      .pipe(
        tap(boughtArchives => console.log('Bought archives: ' + boughtArchives.length)),
        catchError(this.handleError('getBoughtArchives', []))
      );

  }

  // Richiesta per cercare di acquistare gli archivi relativi alle posizioni visualizzate in mappa
  tryToBuy(bodyRequest: BuyRequest, startTimestamp, endTimestamp): Observable<PositionsContainer> {
    let url = this.serverAddress + '/api/users/positions/area?mintime=' + startTimestamp + '&maxtime=' + endTimestamp;
    let body = bodyRequest;

    return this.http.post<PositionsContainer>(url, JSON.stringify(body), {headers: this.myHeader})
      .pipe(
        tap(data => console.log('tryToBuy: ' + JSON.stringify(data)),
          error => console.log('errorTryToBuy', error))
      );
  }

  // Richiesta per completare l'acquisto ed effettuare la transazione
  confirmPayment(dataToBuy: PositionsContainer, username: string): Observable<Archive | Archive[]> {
    let url = this.serverAddress + '/api/customers/' + username + '/archives/area/buy';
    let body = dataToBuy.archiveList;

    return this.http.post<Archive | Archive[]>(url, JSON.stringify(body), {headers: this.myHeader})
      .pipe(
        tap(data => console.log('confirmPayment: ' + JSON.stringify(data)),
          error => console.log('errorConfirmPayment', error))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      //console.error(error.error.error); // log error message
      //console.error(error.status); // log error status code


      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      result = error;
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
