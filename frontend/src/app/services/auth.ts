import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  LoginRequest,
  RegisterRequest,
  TokenResponse
} from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${environment.authUrl}/login/`,
      data
    );
  }

  register(data: RegisterRequest) {
    return this.http.post(
      `${environment.authUrl}/register/`,
      data
    );
  }

  refresh(refresh: string) {
    return this.http.post<TokenResponse>(
      `${environment.authUrl}/refresh/`,
      { refresh }
    );
  }

  me() {
    return this.http.get(
      `${environment.authUrl}/me/`
    );
  }

}
export class Auth{}