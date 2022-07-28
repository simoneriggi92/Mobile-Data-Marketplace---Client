import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MessageService {
  messages: string[] = [];
  private subject = new Subject<any>();

  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  add(message: string) {
    this.messages.push(message);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  clear() {
    this.messages = [];
  }
}
