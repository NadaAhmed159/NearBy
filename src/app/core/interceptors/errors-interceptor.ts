import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        err.error?.message ||
        err.error?.errors ||
        err.message ||
        'An unexpected error occurred';

      if (
        err.status === 401 &&
        !req.url.includes('/users/signin') &&
        !req.url.includes('/users/change-password')
      ) {
        localStorage.removeItem('socialToken');
        localStorage.removeItem('userData');
        router.navigate(['/login']);
      }

      toastrService.error(msg, 'NearBy Social', {
        timeOut: 3000,
        closeButton: true,
        progressBar: true,
      });
      return throwError(() => err);
    }),
  );
};


