import {Directive} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {SigninService} from '../service/signin.service';
import {catchError, map} from 'rxjs/operators';

@Directive({
  selector: '[uniqueUsername]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: UniqueUsernameValidatorDirective, multi: true}]
})
export class UniqueUsernameValidatorDirective implements AsyncValidator {

  constructor(private signinService: SigninService) {
  }

  validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    console.log("Message: " + c.value);
    return this.signinService.getUserByUsername(c.value).pipe(
      map(user => {
        return {'uniqueUsername': true};
      }),
      catchError(err => of([]))
    );
  }

}
