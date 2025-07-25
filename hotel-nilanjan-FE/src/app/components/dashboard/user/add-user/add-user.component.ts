import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
})
export class AddUserComponent implements OnInit {
  userForm: any;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private snackbarService: SnackbarService) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required], [this.usernameExistsValidator()]],
    });
  }

  onSubmit() {
    if (this.userForm?.valid) {
      this.userService.addUser({user_name: this.userForm.value.username}).subscribe({
        next: () => {
          this.snackbarService.showMessage('User Added Successfully!', 'success');
          this.router.navigate(['dashboard/user-list']);
        },
        error: (err) => {
          this.snackbarService.showMessage('Failed! Please try again.', 'error');
        }
      });
    }
  }

  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.userService.checkUsernameExists(control.value).pipe(
        map(isTaken => (isTaken ? { usernameExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  back(){
    this.router.navigate(['dashboard/user-list']);
  }
}
