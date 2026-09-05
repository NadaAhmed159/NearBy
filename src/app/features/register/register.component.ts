import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  errMsg: string = '';
  loading: boolean = false;
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    ]),
    rePassword: new FormControl('', [Validators.required]),
  });

  submitform(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.authService.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },
        error: (err: HttpErrorResponse) => {
          this.errMsg = err.error.message;
          this.loading = false;
        },
        complete: () => {
          this.errMsg = '';
          this.loading = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
