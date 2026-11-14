import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  passwordForm!: FormGroup;
  loading = false;
  errMsg = '';

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [this.matchPasswords] },
    );
  }

  matchPasswords(group: AbstractControl) {
    const newPass = group.get('newPassword')?.value;
    const confirmCtrl = group.get('confirmPassword');
    const confirmPass = confirmCtrl?.value;
    if (newPass !== confirmPass && confirmPass !== '') {
      confirmCtrl?.setErrors({ ...(confirmCtrl.errors || {}), mismatch: true });
      return { mismatch: true };
    }
    if (confirmCtrl?.hasError('mismatch')) {
      const { mismatch, ...rest } = confirmCtrl.errors || {};
      confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  }

  submitForm(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errMsg = '';
    const { password, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ password, newPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.data?.token) {
          localStorage.setItem('socialToken', res.data.token);
        }
        this.toastr.success(res?.message || 'Password updated successfully!', 'NearBy Social');
        this.passwordForm.reset();
        this.router.navigate(['/feed']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errMsg = err.error?.message || 'Failed to update password.';
      },
    });
  }

  togglePassword(element: HTMLInputElement): void {
    element.type = element.type === 'password' ? 'text' : 'password';
  }
}

