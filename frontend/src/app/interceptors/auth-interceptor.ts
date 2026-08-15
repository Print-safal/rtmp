import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // These endpoints do not require authentication
  const publicUrls = [
    '/api/auth/login/',
    '/api/auth/register/',
    '/api/auth/refresh/'
  ];

  const isPublic = publicUrls.some(url =>
    req.url.includes(url)
  );

  if (isPublic) {
    return next(req);
  }

  const token = localStorage.getItem('access');

  if (token) {

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  return next(req);
};