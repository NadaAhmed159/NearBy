import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  errMsg: string = '';
  loading: boolean = false;
  loginForm!: FormGroup;
  loginFormSub: Subscription = new Subscription();

  ngOnInit(): void {
    this.loginFormInit();
  }
  loginFormInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          ),
        ],
      ],
    });
  }

  submitform(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loginFormSub.unsubscribe();
      this.loginFormSub = this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('socialToken', res.data.token);
          localStorage.setItem('userData', JSON.stringify(res.data.user));
          this.router.navigate(['/feed']);
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
      this.loginForm.markAllAsTouched();
    }
  }
  togglePassword(element: HTMLInputElement) {
    if (element.type === 'password') {
      element.type = 'text';
    } else {
      element.type = 'password';
    }
  }
}
