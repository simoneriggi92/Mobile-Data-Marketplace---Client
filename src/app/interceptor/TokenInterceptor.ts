import {Inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {catchError} from 'rxjs/operators';
import {AuthService} from '../service/auth.service';
import {MessageService} from '../service/message.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  serverAddress: string;

  constructor(@Inject('serverAddress')serverAddress, public authService: AuthService, public messageService: MessageService) {
    this.serverAddress = serverAddress;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const access_token = this.authService.getAccessToken();
    if (access_token != null) {

      const cloned = request.clone({
        headers: request.headers.set('Authorization',
          'Bearer ' + access_token)
      });
      return next.handle(cloned);
    }
    if (access_token == null && request.url === this.serverAddress + '/enrollment') {
      return next.handle(request);

    } else {
      return next.handle(request)
        .pipe(catchError((error, caught) => {
          this.handleAuthError(error);
          return of(error);
        }) as any);


    }
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    // se l'utente non è presente sul server
    if (err.status === 400) {
      // invio alla pagina di login l'errore
      this.messageService.sendMessage('Login failed');
      return of(err);
    }
  }
}
