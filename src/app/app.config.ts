// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { AuthInterceptor } from './core/interceptors/auth.interceptor';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),
//         provideHttpClient(
//       withInterceptors([AuthInterceptor])
//     )
//   ]
// };


import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';



export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authReq = req.clone({
    setHeaders: {
      Authorization: 'Bearer YOUR_AUTH_TOKEN'
    }
  });

  return next(authReq);
};


export const AppSettings = {
  apiUrl: 'https://api.example.com',
  featureFlags: {
    meetings: true,
    scheduling: true
  }
};


export const appConfig: ApplicationConfig = {
  // providers: [
  //   provideHttpClient(
  //     withInterceptors([authInterceptor])
  //   )
  // ]
  providers: [
  provideHttpClient()
]
};