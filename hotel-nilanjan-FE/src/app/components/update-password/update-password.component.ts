import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css'],
})
export class UpdatePasswordComponent implements OnInit {
  updatePasswordForm: FormGroup;
  userId: number = 0;
  err = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {
    this.updatePasswordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.userId = params.id;
    });
  }

  passwordMatchValidator(
    group: FormGroup
  ): null | { passwordMismatch: boolean } {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    // Set or clear the passwordMismatch error
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  errorMessage: string | null = null;

  onUpdatePassword() {
    if (this.updatePasswordForm.valid) {
      let params = this.updatePasswordForm.value;
      params['id'] = this.userId;

      this.authService.updatePassword(params).subscribe({
        next: (data: any) => {
          this.snackbarService.showMessage('Password Updated Successfully!', 'success');
          this.authService.logout();
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update password. Please try again.';
          this.snackbarService.showMessage(this.errorMessage, 'error');
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}
