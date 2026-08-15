
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http=inject(HttpClient)
  getUsers() {
  return this.http.get<User[]>(
    `${environment.authUrl}/users/`
  );
}
}
