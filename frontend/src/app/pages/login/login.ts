import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';

  login() {
    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem('access', response.access);
          localStorage.setItem('refresh', response.refresh);

          console.log('Login successful');

          this.router.navigate(['/chats']);
        },

        error: (err) => {
          console.error(err);
        },
      });
  }
}
