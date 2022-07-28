import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({

  /*
   *  We can use this selector as an attribute either on the password field or confirm password field
   *  that's actually included on the confirm password field.
   *  We need to register our validator with the list of validators that angular maintains: this list is
   *  in NG_VALIDATORS, that contains all the validators including the built-in validators.
   *  For that, we are going to use providers properties.
   */
  selector: '[appConfirmEqualValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ConfirmEqualValidatorDirective,
    multi: true   /*  It's essentially set this multi property to true to tell angular that we want to add
                   *  our custom validator class to the list of validators angular maintains
                   */
  }]
})
export class ConfirmEqualValidatorDirective  implements Validator{

  @Input() appConfirmEqualValidator: string;

  constructor() { }

  /*
   *  This method is going to receive the control that we want to validate as a parameter.
   *  We are using this control as an attribute (in the HTML) on the element that we want
   *  to validate (confirm password field); so this field will be passed into this method as a parameter.
   *
   *  Return Type:
   *    This methods returns either an object or null. In particolar:
   *      - if the validation succeeds it returns null,
   *      - if the validation fails it returns this object (key value pair).
   */
  validate(control: AbstractControl): {[key:string]: any} | null{
    /*  To get the reference to the password field, we create a constant and call the controlToCompare and that's equals to
     *  the control that is coming into a validate method as a parameter: this control is nothing but the confirm password field
     *  so the confirm password field is coming into this method as input parameter on that we call parent (password field)
     */
    const controlToCompare = control.parent.get(this.appConfirmEqualValidator);
    if (controlToCompare && controlToCompare.value !== control.value){
      return { 'notEqual': true };
    }
    return null;
  }
}
