import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  console.log('INTERCEPTOR RUNNING for URL:', req.url);

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('INTERCEPTOR: Token attached successfully');
    return next(cloned);
  }

  console.warn('INTERCEPTOR: No token found in localStorage!');
  return next(req);
};
