import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, pipe, throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      toastrService.error(err.error.message, 'SocialMedia App', {
        timeOut: 3000,
        closeButton: true,
        progressBar: true,
      });
      return throwError(() => err);
    }),
  );
};
