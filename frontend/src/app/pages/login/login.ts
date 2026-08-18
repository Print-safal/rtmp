import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule,RouterLink ,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';
  errorMessage = '';

  login(): void {
    this.errorMessage = '';

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
          this.errorMessage = 'Unable to sign in. Please check your username and password.';
        },
      });
  }
}
