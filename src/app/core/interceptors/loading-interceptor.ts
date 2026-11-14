import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const ngxSpinnerService = inject(NgxSpinnerService);

  // Skip full-screen blocking spinner for lightweight background/toggle requests
  const isSilentRequest =
    req.url.includes('/unread-count') ||
    req.url.endsWith('/like') ||
    req.url.endsWith('/bookmark') ||
    req.url.endsWith('/follow') ||
    req.url.endsWith('/read') ||
    req.url.endsWith('/read-all');

  if (!isSilentRequest) {
    if (activeRequests === 0) {
      ngxSpinnerService.show();
    }
    activeRequests++;
  }

  return next(req).pipe(
    finalize(() => {
      if (!isSilentRequest) {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          ngxSpinnerService.hide();
        }
      }
    }),
  );
};

