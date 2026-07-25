import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.authUrl}/login/`, data);
  }

  register(data: RegisterRequest) {
    return this.http.post(`${environment.authUrl}/register/`, data);
  }

  refresh(refresh: string) {
    return this.http.post<TokenResponse>(`${environment.authUrl}/refresh/`, { refresh });
  }

  me() {
    return this.http.get(`${environment.authUrl}/me/`);
  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access');

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  logout() {
    localStorage.clear();
  }
}
export class Auth {}
