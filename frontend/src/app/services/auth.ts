import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
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

  register(data: { username: string; email: string; password: string; display_name: string }) {
    return this.http.post(`${environment.authUrl}/register/`, data);
  }

  refresh(refresh: string) {
    return this.http.post<TokenResponse>(`${environment.authUrl}/refresh/`, { refresh });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${environment.authUrl}/me/`);
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
  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  }
  updateProfile(data: { display_name?: string; bio?: string }) {
    return this.http.patch<User>(`${environment.authUrl}/me/`, data);
  }
}
export class Auth {}
