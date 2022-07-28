import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UserDataService {
  private messageSource = new BehaviorSubject<object>({'usernameID': 'all-user-dafault', 'usernameAlias': 'all-user-dafault', 'toAdd': false});
  currentMessage = this.messageSource.asObservable();
  constructor() { }

  changeMessage(userToBeUpdated: object) {
    this.messageSource.next(userToBeUpdated);
  }
}
