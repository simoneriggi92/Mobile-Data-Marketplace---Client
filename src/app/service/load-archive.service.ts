import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Archive} from '../model/archive';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadArchiveService {
  serverAddress: string;
  baseurl: string;

  private myHeader = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(@Inject('serverAddress')serverAddress, private http: HttpClient, private authService: AuthService) {
    this.serverAddress = serverAddress;
    this.baseurl = this.serverAddress + '/api/users/';
  }

  loadArchive(fileContent: any): Observable<Archive | String> {
    let username = this.authService.getUsername();
    let url = this.baseurl + username + '/archives';
    return this.http.post<Archive | String>(url, fileContent.toString(), {headers: this.myHeader})
      .pipe(
        tap(archive => console.log('archive loaded: ', archive)),
        catchError(this.handleError<string>('loadArchive', 'my result...'))
      );
  }

  getArchives(): Observable<Archive[]> {
    let username = this.authService.getUsername();
    let url = this.baseurl + username + '/archives';
    return this.http.get<Archive[]>(url)
      .pipe(
        tap(archives => console.log('fetched archives')),
        catchError(this.handleError('getArchives', []))
      );
  }

  deleteArchive(archiveId: string): Observable<Archive> {
    let username = this.authService.getUsername();
    let url = this.baseurl + username + '/delete/archives/' + archiveId;
    return this.http.post<Archive>(url, null, {headers: this.myHeader})
      .pipe(
        tap(_ => console.log('deleted archive')),
        catchError(this.handleError<Archive>('deleteArchive'))
      );
  }

  deleteAllArchives(): Observable<Archive> {
    let username = this.authService.getUsername();
    let url = this.serverAddress + '/api/users/' + username + '/delete/archives/all';
    return this.http.post<Archive>(url, null, {headers: this.myHeader})
      .pipe(
        tap(_ => console.log('deleted archives')),
        catchError(this.handleError<Archive>('deleteArchives'))
      );
  }

  downloadBoughtArchive(archiveId: string): Observable<Archive> {
    let username = this.authService.getUsername();
    let url = this.baseurl + username + '/archivesbought/' + archiveId;
    return this.http.get<Archive>(url)
      .pipe(
        tap(_ => console.log('archive downloaded')),
        catchError(this.handleError<Archive>('downloadArchive'))
      );
  }

  downloadLoadedArchive(archiveId: string): Observable<Archive> {
    let username = this.authService.getUsername();
    let url = this.baseurl + username + '/archives/' + archiveId;
    return this.http.get<Archive>(url)
      .pipe(
        tap(_ => console.log('archive downloaded')),
        catchError(this.handleError<Archive>('downloadArchive'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: Response): Observable<T> => {
      if (error.status === 403 && operation === 'loadArchive') {
        (<string><any>result) = 'archive_refused';
      } else {
        (<string><any>result) = 'error_connection';
      }
      return of(result);
    };
  }
}
