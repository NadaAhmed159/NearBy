import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { headersInterceptor } from './core/interceptors/headers-interceptor';
import { errorsInterceptor } from './core/interceptors/errors-interceptor';
import { provideToastr } from 'ngx-toastr';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withHashLocation(),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([headersInterceptor, errorsInterceptor, loadingInterceptor]),
    ),
    provideToastr(),
    importProvidersFrom(NgxSpinnerModule),
  ],
};
